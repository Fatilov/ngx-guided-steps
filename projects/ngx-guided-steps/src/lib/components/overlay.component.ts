import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject,
} from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

let nextInstanceId = 0;
import {
  GuidedStepsConfig,
  DEFAULT_CONFIG,
  DEFAULT_LABELS,
  GUIDED_STEPS_CONFIG,
  GuidedStepsLabels,
} from '../models/config.model';
import {
  GuidedStep,
  ResolvedStepData,
} from '../models/step.model';
import {
  PositionService,
  ArrowData,
  LabelPosition,
} from '../services/position.service';

/**
 * Internal state for the overlay, driven by the service.
 */
export interface OverlayState {
  visible: boolean;
  stepIndex: number;
  totalSteps: number;
  step: GuidedStep | null;
  resolved: ResolvedStepData | null;
}

@Component({
  selector: 'ngs-overlay',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngs-overlay"
      [class.ngs-hidden]="!state.visible"
      [class.ngs-transparent]="animating"
      [class.ngs-theme-dark]="config.theme === 'dark'"
      [class.ngs-transitioning]="transitioning"
      [style.z-index]="config.zIndex"
      [style.height]="vpHeight"
      [style.width]="vpWidth"
      [style.top.px]="vpTop"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="dialogLabel"
    >
      <!-- Live region for screen readers -->
      <div class="ngs-sr-only" aria-live="polite" aria-atomic="true">
        {{ liveAnnouncement }}
      </div>

      <!-- SVG overlay with cutout -->
      <svg
        class="ngs-svg"
        [style.height]="vpHeight"
        [style.width]="vpWidth"
        aria-hidden="true"
      >
        <defs>
          <mask [attr.id]="maskId">
            <rect width="100%" height="100%" fill="white" />
            @if (cutout && state.resolved?.shape === 'rect') {
            <rect
              [attr.x]="cutout.x"
              [attr.y]="cutout.y"
              [attr.width]="cutout.w"
              [attr.height]="cutout.h"
              [attr.rx]="cutout.r"
              [attr.ry]="cutout.r"
              fill="black"
              class="ngs-cutout"
            />
            }
            @if (cutout && state.resolved?.shape === 'circle') {
            <circle
              [attr.cx]="cutout.cx"
              [attr.cy]="cutout.cy"
              [attr.r]="cutout.cr"
              fill="black"
              class="ngs-cutout"
            />
            }
          </mask>
          <marker
            [attr.id]="markerId"
            viewBox="0 0 36 21"
            refX="21"
            refY="10"
            markerUnits="strokeWidth"
            orient="auto"
            markerWidth="16"
            markerHeight="12"
          >
            <path
              [attr.stroke]="arrowColor"
              style="fill:none; stroke-width:2"
              d="M0,0 c30,11 30,9 0,20"
            />
          </marker>
        </defs>

        <!-- Dark overlay with cutout mask -->
        <rect
          width="100%"
          height="100%"
          [attr.fill]="config.backgroundColor"
          [attr.mask]="'url(#' + maskId + ')'"
          [style.pointer-events]="config.backdropDismiss ? 'all' : 'none'"
          [style.cursor]="config.backdropDismiss ? 'pointer' : 'default'"
          (click)="onBackdropClick()"
        />

        <!-- Arrow path -->
        @if (arrowPath && !isOversized) {
        <path
          [attr.d]="arrowPath"
          [attr.stroke]="arrowColor"
          style="fill:none; stroke-width:3"
          [attr.marker-end]="'url(#' + markerId + ')'"
          class="ngs-arrow"
        />
        }
      </svg>

      <!-- Label -->
      @if (labelPos && state.step) {
      <div
        #labelEl
        class="ngs-label"
        [class.ngs-label-oversized]="isOversized"
        [style.left.px]="labelPos.x"
        [style.top.px]="labelPos.y"
        [style.z-index]="(config.zIndex || 1010) + 7"
      >
        <span [innerHTML]="state.step.description"></span>
        @if (config.showProgress) {
        <div class="ngs-progress">{{ progressText }}</div>
        }
        @if (countdownSeconds > 0) {
        <div class="ngs-countdown">{{ countdownSeconds }}s</div>
        }
      </div>
      }

      <!-- Event blocker regions (4 zones around the cutout) -->
      @if (cutout) {
      <div
        class="ngs-event-blocker ngs-blocker-top"
        [style.height.px]="blockerTop"
        [style.z-index]="(config.zIndex || 1010) + 1"
        aria-hidden="true"
      ></div>
      <div
        class="ngs-event-blocker ngs-blocker-bottom"
        [style.top.px]="blockerBottomTop"
        [style.z-index]="(config.zIndex || 1010) + 1"
        aria-hidden="true"
      ></div>
      <div
        class="ngs-event-blocker ngs-blocker-left"
        [style.width.px]="blockerLeftWidth"
        [style.z-index]="(config.zIndex || 1010) + 1"
        aria-hidden="true"
      ></div>
      <div
        class="ngs-event-blocker ngs-blocker-right"
        [style.left.px]="blockerRightLeft"
        [style.z-index]="(config.zIndex || 1010) + 1"
        aria-hidden="true"
      ></div>
      }

      <!-- Buttons -->
      @if (showPrev && buttonPos) {
      <button
        type="button"
        class="ngs-btn ngs-prev-btn"
        [class]="prevBtnClass"
        [style.left.px]="buttonPos.prev.x"
        [style.top.px]="buttonPos.prev.y"
        [style.z-index]="(config.zIndex || 1010) + 2"
        (click)="onPrevClick()"
      >{{ prevBtnText }}</button>
      }

      @if (showNext && buttonPos) {
      <button
        #firstFocusable
        type="button"
        class="ngs-btn ngs-next-btn"
        [class]="nextBtnClass"
        [style.left.px]="buttonPos.next.x"
        [style.top.px]="buttonPos.next.y"
        [style.z-index]="(config.zIndex || 1010) + 2"
        (click)="onNextClick()"
      >{{ nextBtnText }}</button>
      }

      @if (showSkip && buttonPos) {
      <button
        type="button"
        class="ngs-btn ngs-skip-btn"
        [class]="skipBtnClass"
        [style.left.px]="buttonPos.skip.x"
        [style.top.px]="buttonPos.skip.y"
        [style.z-index]="(config.zIndex || 1010) + 2"
        (click)="onSkipClick()"
      >{{ skipBtnText }}</button>
      }

      <!-- Close button -->
      <button
        type="button"
        class="ngs-close-btn"
        [style.z-index]="(config.zIndex || 1010) + 2"
        (click)="onSkipClick()"
        [attr.aria-label]="labels.close"
      ></button>
    </div>
  `,
  styles: [`
    :host {
      --ngs-btn-color: rgb(30, 205, 151);
      --ngs-btn-hover-color: white;
      --ngs-label-color: white;
      --ngs-label-font-size: 22px;
      --ngs-label-font-family: 'Segoe UI', Arial, sans-serif;
      --ngs-close-btn-color: rgba(33, 224, 163, 1);
      --ngs-oversized-bg: #272A26;

      position: fixed;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      z-index: 9999;
    }

    .ngs-overlay {
      position: fixed;
      width: 100vw;
      height: 100vh;
      /* stylelint-disable-next-line */
      height: 100dvh;
      top: 0;
      left: 0;
      pointer-events: none;
      overflow: visible;
    }

    .ngs-hidden { display: none; }

    .ngs-transparent .ngs-svg,
    .ngs-transparent .ngs-label {
      opacity: 0;
    }

    .ngs-svg {
      position: absolute;
      width: 100vw;
      height: 100vh;
      /* stylelint-disable-next-line */
      height: 100dvh;
      top: 0;
      left: 0;
      z-index: 100;
      transition: opacity 400ms ease-in-out;
    }

    .ngs-cutout {
      transition: all 200ms ease-in-out;
    }

    .ngs-arrow {
      transition: opacity 400ms ease-in-out;
    }

    .ngs-label {
      display: inline-block;
      max-width: 80%;
      position: absolute;
      overflow: visible;
      overflow-wrap: break-word;
      word-wrap: break-word;
      text-align: center;
      color: var(--ngs-label-color, white);
      font-size: var(--ngs-label-font-size, 22px);
      font-family: var(--ngs-label-font-family, 'Segoe UI', Arial, sans-serif);
      transition: opacity 400ms ease-in-out;
      pointer-events: none;
      padding: 8px 12px;
    }

    .ngs-label-oversized {
      border-radius: 20px;
      background-color: var(--ngs-oversized-bg, #272A26);
      transition: background-color ease-out 0.5s, opacity 400ms ease-in-out;
    }

    @media (max-width: 640px) {
      .ngs-label {
        font-size: 14px;
        max-width: 90%;
        padding: 6px 10px;
      }
    }

    /* Event blockers */
    .ngs-event-blocker {
      position: absolute;
      pointer-events: all;
      touch-action: none;
      -webkit-touch-callout: none;
    }
    .ngs-blocker-top { top: 0; left: 0; width: 100%; }
    .ngs-blocker-bottom { left: 0; width: 100%; height: 2000px; }
    .ngs-blocker-left { top: 0; left: 0; height: 100%; }
    .ngs-blocker-right { top: 0; height: 100%; width: 2000px; }

    /* Buttons */
    .ngs-btn {
      position: absolute;
      pointer-events: all;
      touch-action: manipulation;
      box-sizing: border-box;
      min-width: 100px;
      height: 40px;
      cursor: pointer;
      border: 2px solid var(--ngs-btn-color, rgb(30, 205, 151));
      border-radius: 40px;
      font: normal 17px/40px 'Segoe UI', Helvetica, sans-serif;
      color: var(--ngs-btn-color, rgb(30, 205, 151));
      text-align: center;
      letter-spacing: 1px;
      background: transparent;
      transition: background-color 0.3s, color 0.3s, border-color 0.3s;
      padding: 0 15px;
      white-space: nowrap;
    }

    .ngs-btn:hover {
      color: var(--ngs-btn-hover-color, white);
      background: var(--ngs-btn-color, rgb(30, 205, 151));
    }

    .ngs-btn:active {
      border-color: rgba(33, 224, 163, 1);
      background: rgba(33, 224, 163, 1);
      transition: none;
    }

    @media (max-width: 640px) {
      .ngs-btn {
        font: normal 13px/32px 'Segoe UI', Helvetica, sans-serif;
        min-width: 0;
        height: 32px;
        padding: 0 10px;
        letter-spacing: 0;
      }

      .ngs-skip-btn { display: none; }
    }

    /* Close button */
    .ngs-close-btn {
      display: inline-block;
      position: absolute;
      right: 10px;
      right: max(10px, env(safe-area-inset-right, 0px));
      top: 10px;
      top: max(10px, env(safe-area-inset-top, 0px));
      pointer-events: all;
      touch-action: manipulation;
      box-sizing: content-box;
      width: 24px;
      height: 24px;
      border: 2px solid var(--ngs-close-btn-color, rgba(33, 224, 163, 1));
      border-radius: 50%;
      background: transparent;
      cursor: pointer;
      z-index: 1012;
    }

    .ngs-close-btn::before,
    .ngs-close-btn::after {
      content: '';
      position: absolute;
      width: 60%;
      height: 2px;
      top: 50%;
      left: 20%;
      background: white;
    }

    .ngs-close-btn::before { transform: rotate(45deg); }
    .ngs-close-btn::after { transform: rotate(-45deg); }

    .ngs-close-btn:hover {
      background: rgb(30, 205, 151);
    }

    .ngs-close-btn:active {
      border-color: rgba(33, 224, 163, 1);
      background: rgba(33, 224, 163, 1);
    }

    @media (max-width: 640px) {
      .ngs-close-btn {
        width: 32px;
        height: 32px;
        min-width: 44px;
        min-height: 44px;
        right: 6px;
        right: max(6px, env(safe-area-inset-right, 0px));
        top: 6px;
        top: max(6px, env(safe-area-inset-top, 0px));
      }
    }

    /* Progress indicator */
    .ngs-progress {
      margin-top: 6px;
      font-size: 12px;
      opacity: 0.7;
      letter-spacing: 1px;
    }

    /* Auto-advance countdown */
    .ngs-countdown {
      margin-top: 4px;
      font-size: 11px;
      opacity: 0.6;
      font-variant-numeric: tabular-nums;
    }

    /* Step transition */
    .ngs-transitioning .ngs-label,
    .ngs-transitioning .ngs-arrow,
    .ngs-transitioning .ngs-btn,
    .ngs-transitioning .ngs-close-btn {
      opacity: 0;
      transition: opacity 150ms ease-out;
    }

    /* Dark theme overrides */
    .ngs-theme-dark {
      --ngs-btn-color: #333;
      --ngs-btn-hover-color: white;
      --ngs-label-color: #222;
      --ngs-close-btn-color: #555;
      --ngs-oversized-bg: #e8e8e8;
    }

    .ngs-theme-dark .ngs-close-btn::before,
    .ngs-theme-dark .ngs-close-btn::after {
      background: #333;
    }

    /* Focus indicators */
    .ngs-btn:focus-visible,
    .ngs-close-btn:focus-visible {
      outline: 2px solid white;
      outline-offset: 2px;
    }

    .ngs-theme-dark .ngs-btn:focus-visible,
    .ngs-theme-dark .ngs-close-btn:focus-visible {
      outline-color: #333;
    }

    /* Screen reader only */
    .ngs-sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `],
})
export class GuidedStepsOverlayComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('labelEl') labelEl?: ElementRef<HTMLElement>;

  // Unique SVG IDs per instance to avoid collisions
  private instanceId = nextInstanceId++;
  maskId = `ngs-mask-${this.instanceId}`;
  markerId = `ngs-arrow-marker-${this.instanceId}`;

  config: Required<GuidedStepsConfig>;
  labels: Required<GuidedStepsLabels>;
  state: OverlayState = {
    visible: false,
    stepIndex: 0,
    totalSteps: 0,
    step: null,
    resolved: null,
  };

  // Computed layout
  svgWidth = '100%';
  svgHeight = '100%';
  cutout: {
    x: number; y: number; w: number; h: number; r: number;
    cx: number; cy: number; cr: number;
  } | null = null;
  labelPos: LabelPosition | null = null;
  arrowPath: string | null = null;
  arrowColor = 'rgb(255,255,255)';
  isOversized = false;
  animating = false;
  transitioning = false;

  // Computed label strings
  dialogLabel = '';
  progressText = '';

  // Blocker positions
  blockerTop = 0;
  blockerBottomTop = 0;
  blockerLeftWidth = 0;
  blockerRightLeft = 0;

  // Button state
  showNext = false;
  showPrev = false;
  showSkip = true;
  nextBtnText = 'Next';
  prevBtnText = 'Previous';
  skipBtnText = 'Skip';
  nextBtnClass = 'ngs-btn ngs-next-btn';
  prevBtnClass = 'ngs-btn ngs-prev-btn';
  skipBtnClass = 'ngs-btn ngs-skip-btn';

  buttonPos: {
    prev: { x: number; y: number };
    next: { x: number; y: number };
    skip: { x: number; y: number };
  } | null = null;

  // Visual viewport tracking (mobile keyboard)
  vpHeight: string = '100dvh';
  vpWidth: string = '100vw';
  vpTop: number = 0;

  // Accessibility
  liveAnnouncement = '';

  // Callbacks set by the service
  _onNext: () => void = () => {};
  _onPrev: () => void = () => {};
  _onSkip: () => void = () => {};

  // Auto-advance countdown
  countdownSeconds = 0;
  private autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  private destroy$ = new Subject<void>();
  private pendingRaf: number | null = null;

  private positionService = inject(PositionService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    const userConfig = inject(GUIDED_STEPS_CONFIG, { optional: true });
    this.config = { ...DEFAULT_CONFIG, ...userConfig } as Required<GuidedStepsConfig>;
    this.labels = { ...DEFAULT_LABELS, ...userConfig?.labels };
    // Backwards compat: if old *ButtonText was set but labels.* wasn't, use old value
    if (userConfig?.nextButtonText && !userConfig?.labels?.next) this.labels.next = userConfig.nextButtonText;
    if (userConfig?.prevButtonText && !userConfig?.labels?.prev) this.labels.prev = userConfig.prevButtonText;
    if (userConfig?.skipButtonText && !userConfig?.labels?.skip) this.labels.skip = userConfig.skipButtonText;
  }

  /** Update config at runtime (called by service before each tour) */
  updateConfig(cfg: Required<GuidedStepsConfig>): void {
    this.config = cfg;
    this.labels = { ...DEFAULT_LABELS, ...cfg.labels };
    if (cfg.nextButtonText && !cfg.labels?.next) this.labels.next = cfg.nextButtonText;
    if (cfg.prevButtonText && !cfg.labels?.prev) this.labels.prev = cfg.prevButtonText;
    if (cfg.skipButtonText && !cfg.labels?.skip) this.labels.skip = cfg.skipButtonText;
  }

  ngOnInit(): void {
    fromEvent(window, 'resize')
      .pipe(debounceTime(150), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.state.visible && this.state.step) {
          this.recalculate();
        }
      });

    fromEvent(window, 'scroll', { capture: true })
      .pipe(debounceTime(50), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.state.visible && this.state.step) {
          this.recalculate();
        }
      });

    fromEvent(window, 'orientationchange')
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.state.visible && this.state.step) {
          this.recalculate();
        }
      });

    // Listen to visualViewport resize (fires when mobile keyboard opens/closes)
    if (window.visualViewport) {
      fromEvent(window.visualViewport, 'resize')
        .pipe(debounceTime(100), takeUntil(this.destroy$))
        .subscribe(() => {
          this.applyVisualViewport();
          if (this.state.visible && this.state.step) {
            this.recalculate();
          }
        });

      fromEvent(window.visualViewport, 'scroll')
        .pipe(debounceTime(50), takeUntil(this.destroy$))
        .subscribe(() => {
          this.applyVisualViewport();
          if (this.state.visible && this.state.step) {
            this.recalculate();
          }
        });
    }

    // Keyboard handling: ESC, arrow keys, Tab focus trap
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(takeUntil(this.destroy$))
      .subscribe((e) => {
        if (!this.state.visible) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          this.onSkipClick();
        }
        // Arrow key navigation
        if (this.config.keyboardNav) {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.onNextClick();
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.onPrevClick();
          }
        }
        // Focus trap: Tab/Shift+Tab cycle between visible buttons
        if (e.key === 'Tab') {
          this.trapFocus(e);
        }
      });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearAutoAdvance();
    if (this.pendingRaf !== null) {
      cancelAnimationFrame(this.pendingRaf);
    }
  }

  private interpolate(template: string, vars: Record<string, string | number>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ''));
  }

  /**
   * Called by the service to render a step.
   */
  renderStep(
    step: GuidedStep,
    stepIndex: number,
    totalSteps: number
  ): void {
    const margin = step.margin !== undefined ? step.margin : 10;
    const pos = this.positionService.resolveElementPosition(step.selector, margin);
    if (!pos) {
      console.error(`GuidedSteps: Element not found for selector "${step.selector}"`);
      return;
    }

    const shape = step.shape || 'rect';
    let radius = step.radius || 0;
    let { centerX, centerY, width, height } = pos;

    if (shape === 'circle') {
      const maxDim = Math.max(width, height);
      radius = radius || Math.round(maxDim / 2) + 5;
    }

    // Apply offsets
    const offsets = {
      top: step.top || 0,
      bottom: step.bottom || 0,
      left: step.left || 0,
      right: step.right || 0,
    };

    let halfW: number, halfH: number;

    if (shape === 'circle') {
      halfW = halfH = radius;
      const sidesPos = {
        top: centerY - halfH + offsets.top,
        bottom: centerY + halfH - offsets.bottom,
        left: centerX - halfW + offsets.left,
        right: centerX + halfW - offsets.right,
      };
      const w = sidesPos.right - sidesPos.left;
      const h = sidesPos.bottom - sidesPos.top;
      radius = Math.round(Math.min(w, h) / 2);
      centerX = sidesPos.left + Math.round(w / 2);
      centerY = sidesPos.top + Math.round(h / 2);
    } else {
      halfW = Math.round(width / 2);
      halfH = Math.round(height / 2);
      const sidesPos = {
        top: centerY - halfH + offsets.top,
        bottom: centerY + halfH - offsets.bottom,
        left: centerX - halfW + offsets.left,
        right: centerX + halfW - offsets.right,
      };
      width = sidesPos.right - sidesPos.left;
      height = sidesPos.bottom - sidesPos.top;
      centerX = sidesPos.left + Math.round(width / 2);
      centerY = sidesPos.top + Math.round(height / 2);
    }

    const resolved: ResolvedStepData = {
      step,
      centerX,
      centerY,
      width,
      height,
      radius,
      shape,
    };

    this.state = {
      visible: true,
      stepIndex,
      totalSteps,
      step,
      resolved,
    };

    this.arrowColor = step.arrowColor || 'rgb(255,255,255)';

    // Determine button visibility
    const eventType = step.eventType || 'next';
    this.showNext = step.showNext !== undefined ? step.showNext : eventType === 'next';
    this.showPrev = step.showPrev !== undefined ? step.showPrev : stepIndex > 0;
    this.showSkip = step.showSkip !== undefined ? step.showSkip : true;

    // Button text (step-level > labels > deprecated config)
    this.nextBtnText = step.nextButton?.text || this.labels.next;
    this.prevBtnText = step.prevButton?.text || this.labels.prev;
    this.skipBtnText = step.skipButton?.text || this.labels.skip;

    // Button classes
    this.nextBtnClass = 'ngs-btn ngs-next-btn ' + (step.nextButton?.className || '');
    this.prevBtnClass = 'ngs-btn ngs-prev-btn ' + (step.prevButton?.className || '');
    this.skipBtnClass = 'ngs-btn ngs-skip-btn ' + (step.skipButton?.className || '');

    // Compute label strings from templates
    const templateVars = { current: stepIndex + 1, total: totalSteps };
    this.dialogLabel = this.interpolate(this.labels.stepLabel, templateVars);
    this.progressText = this.interpolate(this.labels.progress, templateVars);

    // Update live announcement for screen readers
    const plainText = step.description.replace(/<[^>]*>/g, '');
    this.liveAnnouncement = this.interpolate(this.labels.stepAnnouncement, {
      ...templateVars,
      description: plainText,
    });

    // Compute cutout
    this.computeCutout(resolved);

    // Compute label and arrow - need to measure label first
    this.cdr.detectChanges();

    // Use a temporary measure to get label size
    this.computeLabelAndArrow(resolved, step.description);

    // Compute blockers
    this.computeBlockers(resolved);

    // Brief transition fade for step change
    this.transitioning = true;
    this.cdr.detectChanges();

    // Recompute button positions after label is rendered
    if (this.pendingRaf !== null) {
      cancelAnimationFrame(this.pendingRaf);
    }
    this.pendingRaf = requestAnimationFrame(() => {
      this.pendingRaf = null;
      this.transitioning = false;
      this.computeButtonPositions();
      this.cdr.detectChanges();
    });

    // Auto-advance countdown
    this.clearAutoAdvance();
    if (step.autoAdvance && step.autoAdvance > 0) {
      this.startAutoAdvance(step.autoAdvance);
    }
  }

  private computeCutout(resolved: ResolvedStepData): void {
    const halfW = resolved.shape === 'circle' ? resolved.radius : Math.round(resolved.width / 2);
    const halfH = resolved.shape === 'circle' ? resolved.radius : Math.round(resolved.height / 2);

    this.cutout = {
      x: resolved.centerX - halfW,
      y: resolved.centerY - halfH,
      w: resolved.shape === 'circle' ? resolved.radius * 2 : resolved.width,
      h: resolved.shape === 'circle' ? resolved.radius * 2 : resolved.height,
      r: resolved.radius,
      cx: resolved.centerX,
      cy: resolved.centerY,
      cr: resolved.radius,
    };
  }

  private computeLabelAndArrow(resolved: ResolvedStepData, text: string): void {
    // Create a temporary off-screen element to measure label
    const isMobile = window.innerWidth < 640;
    const tempLabel = document.createElement('div');
    tempLabel.className = 'ngs-label';
    tempLabel.style.position = 'absolute';
    tempLabel.style.visibility = 'hidden';
    tempLabel.style.maxWidth = isMobile ? '90%' : '80%';
    tempLabel.style.fontSize = isMobile ? '14px' : '22px';
    tempLabel.style.display = 'inline-block';
    tempLabel.innerHTML = text;
    document.body.appendChild(tempLabel);

    const labelWidth = tempLabel.offsetWidth;
    const labelHeight = tempLabel.offsetHeight;
    document.body.removeChild(tempLabel);

    const result = this.positionService.calculateLabelPosition(
      resolved,
      labelWidth,
      labelHeight
    );

    this.labelPos = result.label;
    this.isOversized = result.arrow.xFrom === 0 && result.arrow.yFrom === 0 &&
                       result.arrow.xTo === 0 && result.arrow.yTo === 0;

    if (!this.isOversized) {
      this.arrowPath = this.positionService.generateArrowPath(result.arrow);
    } else {
      this.arrowPath = null;
    }

    // Store arrow data for button positioning
    this._lastArrow = result.arrow;
    this._lastLabelWidth = labelWidth;
    this._lastLabelHeight = labelHeight;
  }

  private _lastArrow: ArrowData = { xFrom: 0, yFrom: 0, xTo: 0, yTo: 0, orientation: 'hor' };
  private _lastLabelWidth = 0;
  private _lastLabelHeight = 0;

  private computeButtonPositions(): void {
    if (!this.labelPos) return;

    // Estimate button widths
    const nextW = this.showNext ? this.measureTextWidth(this.nextBtnText) + 34 : 0;
    const prevW = this.showPrev ? this.measureTextWidth(this.prevBtnText) + 34 : 0;
    const skipW = this.showSkip ? this.measureTextWidth(this.skipBtnText) + 34 : 0;

    this.buttonPos = this.positionService.calculateButtonPositions(
      this.labelPos.x,
      this.labelPos.y,
      this._lastLabelWidth,
      this._lastLabelHeight,
      this._lastArrow.xTo,
      this._lastArrow.xFrom,
      this._lastArrow.yFrom,
      this._lastArrow.yTo,
      nextW,
      prevW,
      skipW,
      this.showPrev,
      this.showNext
    );
  }

  private measureTextWidth(text: string): number {
    const isMobile = window.innerWidth < 640;
    const span = document.createElement('span');
    span.style.position = 'absolute';
    span.style.visibility = 'hidden';
    span.style.font = isMobile
      ? 'normal 13px/32px "Segoe UI", Helvetica, sans-serif'
      : 'normal 17px/40px "Segoe UI", Helvetica, sans-serif';
    span.style.letterSpacing = isMobile ? '0' : '1px';
    span.textContent = text;
    document.body.appendChild(span);
    const w = span.offsetWidth;
    document.body.removeChild(span);
    return w;
  }

  private computeBlockers(resolved: ResolvedStepData): void {
    const halfW = resolved.shape === 'circle' ? resolved.radius : Math.round(resolved.width / 2);
    const halfH = resolved.shape === 'circle' ? resolved.radius : Math.round(resolved.height / 2);

    this.blockerTop = resolved.centerY - halfH;
    this.blockerBottomTop = resolved.centerY + halfH;
    this.blockerLeftWidth = resolved.centerX - halfW;
    this.blockerRightLeft = resolved.centerX + halfW;
  }

  recalculate(): void {
    if (!this.state.step || !this.state.resolved) return;
    this.renderStep(this.state.step, this.state.stepIndex, this.state.totalSteps);
  }

  hide(): void {
    this.clearAutoAdvance();
    this.state = { ...this.state, visible: false };
    this.cutout = null;
    this.labelPos = null;
    this.arrowPath = null;
    this.buttonPos = null;
    this.cdr.detectChanges();
  }

  onNextClick(): void {
    this.clearAutoAdvance();
    this._onNext();
  }

  onPrevClick(): void {
    this.clearAutoAdvance();
    this._onPrev();
  }

  onSkipClick(): void {
    this.clearAutoAdvance();
    this._onSkip();
  }

  onBackdropClick(): void {
    if (this.config.backdropDismiss) {
      this.onSkipClick();
    }
  }

  private startAutoAdvance(ms: number): void {
    this.countdownSeconds = Math.ceil(ms / 1000);
    this.cdr.detectChanges();

    this.countdownInterval = setInterval(() => {
      this.countdownSeconds--;
      if (this.countdownSeconds <= 0) {
        // Only clear the interval, NOT the auto-advance timer
        if (this.countdownInterval !== null) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
        this.countdownSeconds = 0;
      }
      this.cdr.detectChanges();
    }, 1000);

    this.autoAdvanceTimer = setTimeout(() => {
      this.clearAutoAdvance();
      this._onNext();
    }, ms);
  }

  private clearAutoAdvance(): void {
    if (this.autoAdvanceTimer !== null) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
    if (this.countdownInterval !== null) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.countdownSeconds = 0;
  }

  private applyVisualViewport(): void {
    const vv = window.visualViewport;
    if (!vv) return;
    // Only apply if viewport is notably smaller than layout viewport (keyboard open)
    const layoutH = window.innerHeight;
    if (vv.height < layoutH - 50) {
      this.vpHeight = `${vv.height}px`;
      this.vpWidth = `${vv.width}px`;
      this.vpTop = vv.offsetTop;
    } else {
      this.vpHeight = '100dvh';
      this.vpWidth = '100vw';
      this.vpTop = 0;
    }
    this.cdr.detectChanges();
  }

  private trapFocus(e: KeyboardEvent): void {
    const host = document.getElementById('ngs-host');
    if (!host) return;
    const focusable = Array.from(host.querySelectorAll('button')) as HTMLElement[];
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first || !host.contains(document.activeElement)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last || !host.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}
