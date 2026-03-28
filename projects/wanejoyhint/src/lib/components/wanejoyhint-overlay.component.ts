import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  OnInit,
  Inject,
  Optional,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

let nextInstanceId = 0;
import {
  WanejoyhintConfig,
  DEFAULT_CONFIG,
  WANEJOYHINT_CONFIG,
} from '../models/wanejoyhint-config.model';
import {
  WanejoyhintStep,
  ResolvedStepData,
} from '../models/wanejoyhint-step.model';
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
  step: WanejoyhintStep | null;
  resolved: ResolvedStepData | null;
}

@Component({
  selector: 'wanejoyhint-overlay',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="wjh-overlay"
      [class.wjh-hidden]="!state.visible"
      [class.wjh-transparent]="animating"
      [style.z-index]="config.zIndex"
    >
      <!-- SVG overlay with cutout -->
      <svg
        class="wjh-svg"
        [attr.width]="svgWidth"
        [attr.height]="svgHeight"
      >
        <defs>
          <mask [attr.id]="maskId">
            <rect width="100%" height="100%" fill="white" />
            <rect
              *ngIf="cutout && state.resolved?.shape === 'rect'"
              [attr.x]="cutout.x"
              [attr.y]="cutout.y"
              [attr.width]="cutout.w"
              [attr.height]="cutout.h"
              [attr.rx]="cutout.r"
              [attr.ry]="cutout.r"
              fill="black"
              class="wjh-cutout"
            />
            <circle
              *ngIf="cutout && state.resolved?.shape === 'circle'"
              [attr.cx]="cutout.cx"
              [attr.cy]="cutout.cy"
              [attr.r]="cutout.cr"
              fill="black"
              class="wjh-cutout"
            />
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
        />

        <!-- Arrow path -->
        <path
          *ngIf="arrowPath && !isOversized"
          [attr.d]="arrowPath"
          [attr.stroke]="arrowColor"
          style="fill:none; stroke-width:3"
          [attr.marker-end]="'url(#' + markerId + ')'"
          class="wjh-arrow"
        />
      </svg>

      <!-- Label -->
      <div
        *ngIf="labelPos && state.step"
        #labelEl
        class="wjh-label"
        [class.wjh-label-oversized]="isOversized"
        [style.left.px]="labelPos.x"
        [style.top.px]="labelPos.y"
        [style.z-index]="(config.zIndex || 1010) + 7"
        [innerHTML]="state.step.description"
      ></div>

      <!-- Event blocker regions (4 zones around the cutout) -->
      <div
        *ngIf="cutout"
        class="wjh-event-blocker wjh-blocker-top"
        [style.height.px]="blockerTop"
        [style.z-index]="(config.zIndex || 1010) + 1"
      ></div>
      <div
        *ngIf="cutout"
        class="wjh-event-blocker wjh-blocker-bottom"
        [style.top.px]="blockerBottomTop"
        [style.z-index]="(config.zIndex || 1010) + 1"
      ></div>
      <div
        *ngIf="cutout"
        class="wjh-event-blocker wjh-blocker-left"
        [style.width.px]="blockerLeftWidth"
        [style.z-index]="(config.zIndex || 1010) + 1"
      ></div>
      <div
        *ngIf="cutout"
        class="wjh-event-blocker wjh-blocker-right"
        [style.left.px]="blockerRightLeft"
        [style.z-index]="(config.zIndex || 1010) + 1"
      ></div>

      <!-- Buttons -->
      <div
        *ngIf="showPrev && buttonPos"
        class="wjh-btn wjh-prev-btn"
        [class]="prevBtnClass"
        [style.left.px]="buttonPos.prev.x"
        [style.top.px]="buttonPos.prev.y"
        [style.z-index]="(config.zIndex || 1010) + 2"
        (click)="onPrevClick()"
      >{{ prevBtnText }}</div>

      <div
        *ngIf="showNext && buttonPos"
        class="wjh-btn wjh-next-btn"
        [class]="nextBtnClass"
        [style.left.px]="buttonPos.next.x"
        [style.top.px]="buttonPos.next.y"
        [style.z-index]="(config.zIndex || 1010) + 2"
        (click)="onNextClick()"
      >{{ nextBtnText }}</div>

      <div
        *ngIf="showSkip && buttonPos"
        class="wjh-btn wjh-skip-btn"
        [class]="skipBtnClass"
        [style.left.px]="buttonPos.skip.x"
        [style.top.px]="buttonPos.skip.y"
        [style.z-index]="(config.zIndex || 1010) + 2"
        (click)="onSkipClick()"
      >{{ skipBtnText }}</div>

      <!-- Close button -->
      <div
        class="wjh-close-btn"
        [style.z-index]="(config.zIndex || 1010) + 2"
        (click)="onSkipClick()"
      ></div>
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      z-index: 9999;
    }

    .wjh-overlay {
      position: fixed;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .wjh-hidden { display: none; }

    .wjh-transparent .wjh-svg,
    .wjh-transparent .wjh-label {
      opacity: 0;
    }

    .wjh-svg {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: 100;
      transition: opacity 400ms ease-in-out;
    }

    .wjh-cutout {
      transition: all 200ms ease-in-out;
    }

    .wjh-arrow {
      transition: opacity 400ms ease-in-out;
    }

    .wjh-label {
      display: inline-block;
      max-width: 80%;
      position: absolute;
      overflow: hidden;
      text-align: center;
      color: white;
      font-size: 22px;
      font-family: 'Segoe UI', Arial, sans-serif;
      transition: opacity 400ms ease-in-out;
      pointer-events: none;
      padding: 8px 12px;
    }

    .wjh-label-oversized {
      border-radius: 20px;
      background-color: #272A26;
      transition: background-color ease-out 0.5s, opacity 400ms ease-in-out;
    }

    @media (max-width: 640px) {
      .wjh-label {
        font-size: 14px;
        max-width: 90%;
        padding: 6px 10px;
      }
    }

    /* Event blockers */
    .wjh-event-blocker {
      position: absolute;
      pointer-events: all;
    }
    .wjh-blocker-top { top: 0; left: 0; width: 100%; }
    .wjh-blocker-bottom { left: 0; width: 100%; height: 2000px; }
    .wjh-blocker-left { top: 0; left: 0; height: 100%; }
    .wjh-blocker-right { top: 0; height: 100%; width: 2000px; }

    /* Buttons */
    .wjh-btn {
      position: absolute;
      pointer-events: all;
      box-sizing: border-box;
      min-width: 100px;
      height: 40px;
      cursor: pointer;
      border: 2px solid rgb(30, 205, 151);
      border-radius: 40px;
      font: normal 17px/40px 'Segoe UI', Helvetica, sans-serif;
      color: rgb(30, 205, 151);
      text-align: center;
      letter-spacing: 1px;
      background: transparent;
      transition: background-color 0.3s, color 0.3s, border-color 0.3s;
      padding: 0 15px;
      white-space: nowrap;
    }

    .wjh-btn:hover {
      color: white;
      background: rgb(30, 205, 151);
    }

    .wjh-btn:active {
      border-color: rgba(33, 224, 163, 1);
      background: rgba(33, 224, 163, 1);
      transition: none;
    }

    @media (max-width: 640px) {
      .wjh-btn {
        font: normal 13px/32px 'Segoe UI', Helvetica, sans-serif;
        min-width: 0;
        height: 32px;
        padding: 0 10px;
        letter-spacing: 0;
      }

      .wjh-skip-btn { display: none; }
    }

    /* Close button */
    .wjh-close-btn {
      display: inline-block;
      position: absolute;
      right: 10px;
      top: 10px;
      pointer-events: all;
      box-sizing: content-box;
      width: 24px;
      height: 24px;
      border: 2px solid rgba(33, 224, 163, 1);
      border-radius: 50%;
      background: transparent;
      cursor: pointer;
      z-index: 1012;
    }

    .wjh-close-btn::before,
    .wjh-close-btn::after {
      content: '';
      position: absolute;
      width: 60%;
      height: 2px;
      top: 50%;
      left: 20%;
      background: white;
    }

    .wjh-close-btn::before { transform: rotate(45deg); }
    .wjh-close-btn::after { transform: rotate(-45deg); }

    .wjh-close-btn:hover {
      background: rgb(30, 205, 151);
    }

    .wjh-close-btn:active {
      border-color: rgba(33, 224, 163, 1);
      background: rgba(33, 224, 163, 1);
    }
  `],
})
export class WanejoyhintOverlayComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('labelEl') labelEl?: ElementRef<HTMLElement>;

  // Unique SVG IDs per instance to avoid collisions
  private instanceId = nextInstanceId++;
  maskId = `wjh-mask-${this.instanceId}`;
  markerId = `wjh-arrow-marker-${this.instanceId}`;

  config: Required<WanejoyhintConfig>;
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
  nextBtnClass = 'wjh-btn wjh-next-btn';
  prevBtnClass = 'wjh-btn wjh-prev-btn';
  skipBtnClass = 'wjh-btn wjh-skip-btn';

  buttonPos: {
    prev: { x: number; y: number };
    next: { x: number; y: number };
    skip: { x: number; y: number };
  } | null = null;

  // Callbacks set by the service
  _onNext: () => void = () => {};
  _onPrev: () => void = () => {};
  _onSkip: () => void = () => {};

  private destroy$ = new Subject<void>();
  private pendingRaf: number | null = null;

  constructor(
    private positionService: PositionService,
    private cdr: ChangeDetectorRef,
    @Optional() @Inject(WANEJOYHINT_CONFIG) userConfig?: WanejoyhintConfig
  ) {
    this.config = { ...DEFAULT_CONFIG, ...userConfig } as Required<WanejoyhintConfig>;
  }

  ngOnInit(): void {
    fromEvent(window, 'resize')
      .pipe(debounceTime(150), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.state.visible && this.state.step) {
          this.recalculate();
        }
      });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.pendingRaf !== null) {
      cancelAnimationFrame(this.pendingRaf);
    }
  }

  /**
   * Called by the service to render a step.
   */
  renderStep(
    step: WanejoyhintStep,
    stepIndex: number,
    totalSteps: number
  ): void {
    const margin = step.margin !== undefined ? step.margin : 10;
    const pos = this.positionService.resolveElementPosition(step.selector, margin);
    if (!pos) {
      console.error(`Wanejoyhint: Element not found for selector "${step.selector}"`);
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

    // Button text
    this.nextBtnText = step.nextButton?.text || this.config.nextButtonText;
    this.prevBtnText = step.prevButton?.text || this.config.prevButtonText;
    this.skipBtnText = step.skipButton?.text || this.config.skipButtonText;

    // Button classes
    this.nextBtnClass = 'wjh-btn wjh-next-btn ' + (step.nextButton?.className || '');
    this.prevBtnClass = 'wjh-btn wjh-prev-btn ' + (step.prevButton?.className || '');
    this.skipBtnClass = 'wjh-btn wjh-skip-btn ' + (step.skipButton?.className || '');

    // Compute cutout
    this.computeCutout(resolved);

    // Compute label and arrow - need to measure label first
    this.cdr.detectChanges();

    // Use a temporary measure to get label size
    this.computeLabelAndArrow(resolved, step.description);

    // Compute blockers
    this.computeBlockers(resolved);

    this.cdr.detectChanges();

    // Recompute button positions after label is rendered
    if (this.pendingRaf !== null) {
      cancelAnimationFrame(this.pendingRaf);
    }
    this.pendingRaf = requestAnimationFrame(() => {
      this.pendingRaf = null;
      this.computeButtonPositions();
      this.cdr.detectChanges();
    });
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
    tempLabel.className = 'wjh-label';
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
    this.state = { ...this.state, visible: false };
    this.cutout = null;
    this.labelPos = null;
    this.arrowPath = null;
    this.buttonPos = null;
    this.cdr.detectChanges();
  }

  onNextClick(): void {
    this._onNext();
  }

  onPrevClick(): void {
    this._onPrev();
  }

  onSkipClick(): void {
    this._onSkip();
  }
}
