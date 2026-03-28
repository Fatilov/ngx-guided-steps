import {
  Injectable,
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Inject,
  Optional,
} from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';
import {
  WanejoyhintConfig,
  DEFAULT_CONFIG,
  WANEJOYHINT_CONFIG,
} from '../models/wanejoyhint-config.model';
import { WanejoyhintStep } from '../models/wanejoyhint-step.model';
import { WanejoyhintOverlayComponent } from '../components/wanejoyhint-overlay.component';

export interface WanejoyhintEvents {
  onStart?: () => void;
  onEnd?: () => void;
  onSkip?: () => void;
  onNext?: () => void;
}

@Injectable({ providedIn: 'root' })
export class WanejoyhintService {
  private steps: WanejoyhintStep[] = [];
  private currentStep = 0;
  private overlayRef: ComponentRef<WanejoyhintOverlayComponent> | null = null;
  private events: WanejoyhintEvents = {};
  private config: Required<WanejoyhintConfig>;
  private eventListenerCleanup: (() => void) | null = null;
  private customEventSub: Subscription | null = null;
  private running = false;
  private pendingTimeouts: ReturnType<typeof setTimeout>[] = [];


  // Observables for external consumers
  private stepChange$ = new Subject<{ index: number; step: WanejoyhintStep }>();
  private end$ = new Subject<void>();
  private skip$ = new Subject<void>();

  /** Emits on each step change */
  get onStepChange(): Observable<{ index: number; step: WanejoyhintStep }> {
    return this.stepChange$.asObservable();
  }

  /** Emits when the tutorial completes */
  get onEnd(): Observable<void> {
    return this.end$.asObservable();
  }

  /** Emits when the user skips */
  get onSkip(): Observable<void> {
    return this.skip$.asObservable();
  }

  get isRunning(): boolean {
    return this.running;
  }

  get currentStepIndex(): number {
    return this.currentStep;
  }

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
    @Optional() @Inject(WANEJOYHINT_CONFIG) userConfig?: WanejoyhintConfig
  ) {
    this.config = { ...DEFAULT_CONFIG, ...userConfig } as Required<WanejoyhintConfig>;
  }

  /**
   * Set the steps for the tutorial.
   */
  setSteps(steps: WanejoyhintStep[]): void {
    if (!Array.isArray(steps) || steps.length === 0) {
      throw new Error('Wanejoyhint: Steps array must not be empty.');
    }
    this.steps = steps;
  }

  /**
   * Start the tutorial from the beginning.
   */
  run(events?: WanejoyhintEvents): void {
    if (this.steps.length === 0) {
      throw new Error('Wanejoyhint: No steps configured. Call setSteps() first.');
    }
    this.events = events || {};
    this.currentStep = 0;
    this.running = true;
    this.createOverlay();
    this.events.onStart?.();
    this.executeStep();
  }

  /**
   * Resume the tutorial from the current step.
   */
  resume(): void {
    if (!this.running) return;
    this.executeStep();
  }

  /**
   * Re-run from a specific step index.
   */
  reRun(stepIndex: number): void {
    if (this.steps.length === 0) {
      throw new Error('Wanejoyhint: No steps configured. Call setSteps() first.');
    }
    this.currentStep = Math.max(0, Math.min(stepIndex, this.steps.length - 1));
    this.running = true;
    if (!this.overlayRef) this.createOverlay();
    this.executeStep();
  }

  /**
   * Move to the next step programmatically.
   */
  next(): void {
    if (!this.running) return;
    this.currentStep++;
    this.executeStep();
  }

  /**
   * Move to the previous step programmatically.
   */
  prev(): void {
    if (!this.running) return;
    if (this.currentStep > 0) {
      this.currentStep--;
      this.executeStep();
    }
  }

  /**
   * Trigger a named event to advance from a 'custom' event step.
   */
  trigger(eventName: string): void {
    if (!this.running) return;
    if (eventName === 'next') {
      this.next();
    } else if (eventName === 'skip') {
      this.handleSkip();
    } else {
      // For custom event types: advance if current step is a 'custom' step
      const step = this.steps[this.currentStep];
      if (step && step.eventType === 'custom') {
        this.currentStep++;
        this.executeStep();
      }
    }
  }

  /**
   * Stop and destroy the tutorial.
   */
  stop(): void {
    this.clearPendingTimeouts();
    this.cleanupEventListeners();
    this.destroyOverlay();
    this.running = false;
  }

  /**
   * Set the current step index without executing.
   */
  setCurrentStep(index: number): void {
    this.currentStep = index;
  }

  /**
   * Get the current step index.
   */
  getCurrentStep(): number {
    return this.currentStep;
  }

  // ---- Private Methods ----

  private createOverlay(): void {
    if (this.overlayRef) {
      this.destroyOverlay();
    }

    // Remove any existing overlay
    const existing = document.getElementById('wanejoyhint-host');
    if (existing) existing.remove();

    const hostEl = document.createElement('div');
    hostEl.id = 'wanejoyhint-host';
    document.body.appendChild(hostEl);

    this.overlayRef = createComponent(WanejoyhintOverlayComponent, {
      hostElement: hostEl,
      environmentInjector: this.injector,
    });

    // Wire up callbacks
    this.overlayRef.instance._onNext = () => this.handleNext();
    this.overlayRef.instance._onPrev = () => this.handlePrev();
    this.overlayRef.instance._onSkip = () => this.handleSkip();

    this.appRef.attachView(this.overlayRef.hostView);
  }

  private destroyOverlay(): void {
    if (this.overlayRef) {
      this.appRef.detachView(this.overlayRef.hostView);
      this.overlayRef.destroy();
      this.overlayRef = null;
    }
    const host = document.getElementById('wanejoyhint-host');
    if (host) host.remove();
  }

  private executeStep(): void {
    this.clearPendingTimeouts();
    this.cleanupEventListeners();

    // Check if we've passed the last step
    if (this.currentStep >= this.steps.length) {
      this.events.onEnd?.();
      this.end$.next();
      this.stop();
      return;
    }

    if (this.currentStep < 0) {
      this.currentStep = 0;
    }

    const step = this.steps[this.currentStep];

    // Only fire onNext for steps after the first
    if (this.currentStep > 0) {
      this.events.onNext?.();
    }
    this.stepChange$.next({ index: this.currentStep, step });

    // onBeforeStart callback
    step.onBeforeStart?.();

    const timeout = step.timeout || 0;

    const outerTimeout = setTimeout(() => {
      if (!this.running) return;

      // Scroll to element if not in viewport
      const el = document.querySelector(step.selector);
      if (!el) {
        console.error(`Wanejoyhint: Element "${step.selector}" not found.`);
        this.stop();
        return;
      }

      const rect = el.getBoundingClientRect();
      const inViewport =
        rect.top >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);

      if (!inViewport) {
        const scrollSpeed = step.scrollAnimationSpeed || 250;
        this.scrollToElement(el, () => {
          if (!this.running || !this.overlayRef) return;
          this.overlayRef.instance.renderStep(
            step,
            this.currentStep,
            this.steps.length
          );
          this.setupEventListeners(step, el);
        }, scrollSpeed);
      } else {
        if (!this.running || !this.overlayRef) return;
        this.overlayRef.instance.renderStep(
          step,
          this.currentStep,
          this.steps.length
        );
        this.setupEventListeners(step, el);
      }
    }, timeout);

    this.pendingTimeouts.push(outerTimeout);
  }

  private setupEventListeners(step: WanejoyhintStep, el: Element): void {
    const eventType = step.eventType || 'next';

    switch (eventType) {
      case 'auto':
        // Simulate the event and immediately advance
        (el as HTMLElement).click?.();
        this.currentStep++;
        this.executeStep();
        return;

      case 'click': {
        const eventTarget = step.eventSelector
          ? document.querySelector(step.eventSelector)
          : el;
        if (eventTarget) {
          const handler = () => {
            this.currentStep++;
            this.executeStep();
          };
          eventTarget.addEventListener('click', handler, { once: true });
          this.eventListenerCleanup = () => {
            eventTarget.removeEventListener('click', handler);
          };
        }
        break;
      }

      case 'key': {
        const handler = (e: Event) => {
          const keyEvent = e as KeyboardEvent;
          const match = step.key
            ? keyEvent.key === step.key
            : step.keyCode ? keyEvent.keyCode === step.keyCode : false;
          if (match) {
            this.currentStep++;
            this.executeStep();
          }
        };
        el.addEventListener('keydown', handler);
        this.eventListenerCleanup = () => {
          el.removeEventListener('keydown', handler);
        };
        break;
      }

      case 'custom':
        // Will be advanced by calling trigger(eventName) or next()
        break;

      case 'next':
      default:
        // Handled by the Next button click in the overlay
        break;
    }
  }

  private cleanupEventListeners(): void {
    if (this.eventListenerCleanup) {
      this.eventListenerCleanup();
      this.eventListenerCleanup = null;
    }
    if (this.customEventSub) {
      this.customEventSub.unsubscribe();
      this.customEventSub = null;
    }
  }

  private clearPendingTimeouts(): void {
    for (const t of this.pendingTimeouts) {
      clearTimeout(t);
    }
    this.pendingTimeouts = [];
  }

  /**
   * Scroll to an element then invoke callback once scroll settles.
   * We don't lock body scroll — the overlay + event blockers
   * prevent user interaction (same approach as original EnjoyHint).
   */
  private scrollToElement(el: Element, callback: () => void, scrollSpeed: number): void {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const t = setTimeout(() => {
      if (!this.running) return;
      callback();
    }, scrollSpeed + 50);
    this.pendingTimeouts.push(t);
  }

  private handleNext(): void {
    this.currentStep++;
    this.executeStep();
  }

  private handlePrev(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.executeStep();
    }
  }

  private handleSkip(): void {
    this.events.onSkip?.();
    this.skip$.next();
    this.stop();
  }
}
