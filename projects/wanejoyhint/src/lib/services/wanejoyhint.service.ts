import {
  Injectable,
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
} from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';
import {
  WanejoyhintConfig,
  DEFAULT_CONFIG,
  WANEJOYHINT_CONFIG,
  WANEJOYHINT_ROUTER,
  WanejoyhintRouter,
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

  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private router = inject(WANEJOYHINT_ROUTER, { optional: true });

  constructor() {
    const userConfig = inject(WANEJOYHINT_CONFIG, { optional: true });
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
   * Validate that all step selectors exist in the DOM.
   * Returns an array of missing selectors, or empty array if all valid.
   */
  validateSteps(): string[] {
    return this.steps
      .map(s => s.selector)
      .filter(selector => !document.querySelector(selector));
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

    // onBeforeStart callback — supports both sync and async
    const beforeResult = step.onBeforeStart?.();
    if (beforeResult instanceof Promise) {
      beforeResult.then(() => this._scheduleStep(step));
      return;
    }

    this._scheduleStep(step);
  }

  private _scheduleStep(step: WanejoyhintStep): void {
    const timeout = step.timeout || 0;

    const outerTimeout = setTimeout(async () => {
      if (!this.running) return;

      // Navigate to route if specified and router is available
      if (step.route && this.router) {
        await this.router.navigate([step.route]);
        // Small delay to let Angular render the new route
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (!this.running) return;

      // Wait for the element (with optional polling)
      const el = await this.waitForElement(step.selector, step.waitForSelector);
      if (!el) {
        console.error(`Wanejoyhint: Element "${step.selector}" not found after waiting.`);
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

  private waitForElement(selector: string, wait?: boolean | number): Promise<Element | null> {
    const el = document.querySelector(selector);
    if (el) return Promise.resolve(el);

    if (!wait) return Promise.resolve(null);

    const timeout = typeof wait === 'number' ? wait : 10000;
    const interval = 200;

    return new Promise(resolve => {
      let elapsed = 0;
      const timer = setInterval(() => {
        const found = document.querySelector(selector);
        if (found) {
          clearInterval(timer);
          resolve(found);
          return;
        }
        elapsed += interval;
        if (elapsed >= timeout) {
          clearInterval(timer);
          resolve(null);
        }
      }, interval);
      // Store for cleanup
      this.pendingTimeouts.push(timer as any);
    });
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
    const step = this.steps[this.currentStep];
    step?.onNext?.();
    this.currentStep++;
    this.executeStep();
  }

  private handlePrev(): void {
    if (this.currentStep > 0) {
      const step = this.steps[this.currentStep];
      step?.onPrev?.();
      this.currentStep--;
      this.executeStep();
    }
  }

  private handleSkip(): void {
    const step = this.steps[this.currentStep];
    step?.onSkip?.();
    this.events.onSkip?.();
    this.skip$.next();
    this.stop();
  }
}
