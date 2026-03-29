import { Injectable } from '@angular/core';
import { ResolvedStepData } from '../models/step.model';

export interface LabelPosition {
  x: number;
  y: number;
}

export interface ArrowData {
  xFrom: number;
  yFrom: number;
  xTo: number;
  yTo: number;
  orientation: 'hor' | 'ver';
}

export interface ButtonPosition {
  x: number;
  y: number;
}

interface AreaCandidate {
  name: string;
  area: number;
  width: number;
  height: number;
}

@Injectable({ providedIn: 'root' })
export class PositionService {
  /** Returns the effective viewport size, preferring visualViewport when the keyboard is open. */
  private getViewportSize(): { vw: number; vh: number } {
    const vv = window.visualViewport;
    if (vv && vv.height < window.innerHeight - 50) {
      return { vw: vv.width, vh: vv.height };
    }
    return { vw: window.innerWidth, vh: window.innerHeight };
  }

  /**
   * Resolve element position from DOM selector.
   */
  resolveElementPosition(
    selector: string,
    margin: number = 10
  ): { centerX: number; centerY: number; width: number; height: number } | null {
    const el = document.querySelector(selector);
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    return {
      centerX: rect.left + Math.round(rect.width / 2),
      centerY: rect.top + Math.round(rect.height / 2),
      width: rect.width + margin,
      height: rect.height + margin,
    };
  }

  /**
   * Calculate the best label position using the 8-zone algorithm
   * mirrored from the original EnjoyHint.
   */
  calculateLabelPosition(
    data: ResolvedStepData,
    labelWidth: number,
    labelHeight: number
  ): { label: LabelPosition; arrow: ArrowData } {
    const { vw, vh } = this.getViewportSize();

    const halfW =
      data.shape === 'circle'
        ? data.radius
        : Math.round(data.width / 2);
    const halfH =
      data.shape === 'circle'
        ? data.radius
        : Math.round(data.height / 2);

    const topOffset = data.centerY - halfH;
    const bottomOffset = vh - (data.centerY + halfH);
    const leftOffset = data.centerX - halfW;
    const rightOffset = vw - (data.centerX + halfW);

    const isMobileView = vw < 640;
    const isSmallMobile = vw <= 360;
    const isMidMobile = vw <= 414;
    const labelShift = isMobileView
      ? (isSmallMobile ? 50 : (isMidMobile ? 65 : 80))
      : (vh < 670 ? 130 : 150);
    const labelMargin = isMobileView ? 0 : (vh < 670 ? 0 : 40);
    const labelShiftWithHeight = labelShift + labelHeight + labelMargin;
    const labelVerOffset = halfH + labelShift;
    const labelVerticalSpaceRequired =
      vh <= 670 ? labelShiftWithHeight : labelShiftWithHeight + 20;

    const areas: AreaCandidate[] = [
      { name: 'right_center', area: rightOffset * vh, width: rightOffset, height: vh },
      { name: 'right_top', area: rightOffset * topOffset, width: rightOffset, height: topOffset },
      { name: 'right_bottom', area: rightOffset * bottomOffset, width: rightOffset, height: bottomOffset },
      { name: 'left_center', area: leftOffset * vh, width: leftOffset, height: vh },
      { name: 'left_top', area: leftOffset * topOffset, width: leftOffset, height: topOffset },
      { name: 'left_bottom', area: leftOffset * bottomOffset, width: leftOffset, height: bottomOffset },
      { name: 'center_top', area: vw * topOffset, width: vw, height: topOffset },
      { name: 'center_bottom', area: vw * bottomOffset, width: vw, height: bottomOffset },
    ];

    // Sort by area ascending, pick the last one that fits
    areas.sort((a, b) => a.area - b.area);

    let bestZone = 'oversized';
    for (const candidate of areas) {
      if (
        candidate.width > labelWidth &&
        candidate.height > labelVerticalSpaceRequired
      ) {
        bestZone = candidate.name;
      }
    }

    const dataWidthSize =
      data.shape === 'circle' ? data.radius * 2 : (data.width || data.radius * 2 || 0);
    const dataHeightSize =
      data.shape === 'circle' ? data.radius * 2 : (data.height || data.radius * 2 || 0);

    const isMobile = vw < 640;
    const horGap = isMobile ? 20 : 80;
    const rightPos = data.centerX + dataWidthSize / 2 + horGap;
    const leftPos = data.centerX - labelWidth - dataWidthSize / 2 - horGap;
    const centralPos = vw / 2 - labelWidth / 2;
    const topPos = data.centerY - labelVerOffset - labelHeight;
    const bottomPos = data.centerY + labelVerOffset;
    const centralVerPos = vh / 2 - labelVerticalSpaceRequired / 2 + 20;

    let labelX = centralPos;
    let labelY = centralVerPos;
    let xTo = data.centerX;
    let yTo = data.centerY;
    let orientation: 'hor' | 'ver' = 'hor';

    switch (bestZone) {
      case 'center_top':
        labelY = topPos;
        labelX = centralPos;
        xTo = data.centerX;
        yTo = data.centerY - dataHeightSize / 2 - 20;
        break;
      case 'center_bottom':
        labelY = bottomPos;
        labelX = centralPos;
        xTo = data.centerX;
        yTo = data.centerY + dataHeightSize / 2 + 20;
        break;
      case 'left_center':
        labelY = centralVerPos;
        labelX = leftPos;
        xTo = data.centerX - dataWidthSize / 2 - 20;
        yTo = data.centerY;
        orientation = 'ver';
        break;
      case 'left_top':
        labelY = topPos;
        labelX = leftPos;
        xTo = data.centerX - dataWidthSize / 2;
        yTo = data.centerY - 20;
        break;
      case 'left_bottom':
        labelY = bottomPos;
        labelX = leftPos;
        xTo = data.centerX - dataWidthSize / 2;
        yTo = data.centerY + 20;
        orientation = 'ver';
        break;
      case 'right_center':
        labelY = centralVerPos;
        labelX = rightPos;
        xTo = data.centerX + dataWidthSize / 2 + 20;
        yTo = data.centerY;
        orientation = 'ver';
        break;
      case 'right_top':
        labelY = topPos;
        labelX = rightPos;
        xTo = data.centerX + dataWidthSize / 2;
        yTo = data.centerY - 20;
        break;
      case 'right_bottom':
        labelY = bottomPos;
        labelX = rightPos;
        xTo = data.centerX + dataWidthSize / 2;
        yTo = data.centerY + 20;
        orientation = 'ver';
        break;
      case 'oversized':
        labelY = centralVerPos;
        labelX = centralPos;
        // No arrow for oversized
        break;
    }

    // Compute arrow origin from label
    let xFrom = labelX + labelWidth / 2;
    let yFrom =
      data.centerY > labelY + labelHeight / 2
        ? labelY + labelHeight
        : labelY;

    // Clamp yTo to viewport
    if (data.centerY < 0) {
      yTo = 20;
    } else if (data.centerY > vh + 20) {
      yTo = vh - 20;
    }

    // If element is at the same vertical position as the label
    if (data.centerY >= labelY && data.centerY <= labelY + labelHeight) {
      xFrom = data.centerX > labelX ? labelX + labelWidth : labelX;
      yFrom = data.centerY;
    }

    // Clamp label to viewport bounds
    const padding = isMobile ? 8 : 10;
    if (labelX < padding) labelX = padding;
    if (labelX + labelWidth > vw - padding) labelX = vw - labelWidth - padding;
    if (labelY < padding) labelY = padding;
    if (labelY + labelHeight > vh - padding) labelY = vh - labelHeight - padding;

    // Recompute arrow origin after clamping
    xFrom = labelX + labelWidth / 2;
    yFrom =
      data.centerY > labelY + labelHeight / 2
        ? labelY + labelHeight
        : labelY;

    if (data.centerY >= labelY && data.centerY <= labelY + labelHeight) {
      xFrom = data.centerX > labelX ? labelX + labelWidth : labelX;
      yFrom = data.centerY;
    }

    return {
      label: { x: labelX, y: labelY },
      arrow: bestZone === 'oversized'
        ? { xFrom: 0, yFrom: 0, xTo: 0, yTo: 0, orientation: 'hor' }
        : { xFrom, yFrom, xTo, yTo, orientation },
    };
  }

  /**
   * Calculate button positions relative to label.
   */
  calculateButtonPositions(
    labelX: number,
    labelY: number,
    labelWidth: number,
    labelHeight: number,
    xTo: number,
    xFrom: number,
    yFrom: number,
    yTo: number,
    nextBtnWidth: number,
    prevBtnWidth: number,
    skipBtnWidth: number,
    showPrev: boolean,
    showNext: boolean
  ): { prev: ButtonPosition; next: ButtonPosition; skip: ButtonPosition } {
    const { vw, vh } = this.getViewportSize();
    const summaryWidth = nextBtnWidth + skipBtnWidth + prevBtnWidth + 30;
    let distance = labelX - 100;
    const btnHeight = 36;
    let verPos = labelY + labelHeight + 40;

    if (summaryWidth + labelX > xTo) {
      distance = xTo >= xFrom ? xTo + 20 : labelX + labelWidth / 2;
    }

    if (summaryWidth + distance > vw || distance < 0) {
      distance = 10;
      verPos = yFrom < yTo ? labelY - 80 : labelY + labelHeight + 40;
    }

    // Clamp verPos so buttons stay within viewport vertically
    const minY = 10;
    if (verPos < minY) {
      verPos = minY;
    } else if (verPos + btnHeight > vh - minY) {
      verPos = vh - btnHeight - minY;
    }

    let leftNext = distance + prevBtnWidth + 10;
    let leftSkip = distance + prevBtnWidth + nextBtnWidth + 20;

    if (!showNext) {
      leftSkip = distance + prevBtnWidth + 10;
    }
    if (!showPrev) {
      leftNext = distance;
      leftSkip = distance + nextBtnWidth + 10;
    }

    // Clamp all button positions to stay within viewport, accounting for button widths
    const minX = 10;
    distance = Math.max(minX, Math.min(distance, vw - prevBtnWidth - minX));
    leftNext = Math.max(minX, Math.min(leftNext, vw - nextBtnWidth - minX));
    leftSkip = Math.max(minX, Math.min(leftSkip, vw - skipBtnWidth - minX));

    // If total button width exceeds viewport, stack buttons vertically
    const btnRowHeight = 40;
    let prevY = verPos;
    let nextY = verPos;
    let skipY = verPos;

    if (summaryWidth > vw - 2 * minX) {
      // Buttons don't fit in a single row; stack them
      distance = minX;
      leftNext = minX;
      leftSkip = minX;
      if (showPrev) {
        nextY = prevY + btnRowHeight;
        skipY = prevY + btnRowHeight * 2;
      } else {
        skipY = nextY + btnRowHeight;
      }

      // Clamp stacked buttons so the bottommost row stays in viewport
      const maxBottomY = Math.max(prevY, nextY, skipY);
      if (maxBottomY + btnHeight > vh - minY) {
        const overflow = maxBottomY + btnHeight - (vh - minY);
        prevY -= overflow;
        nextY -= overflow;
        skipY -= overflow;
        // Ensure none go above the viewport
        const minStackY = Math.min(prevY, nextY, skipY);
        if (minStackY < minY) {
          const shift = minY - minStackY;
          prevY += shift;
          nextY += shift;
          skipY += shift;
        }
      }
    }

    return {
      prev: { x: distance, y: prevY },
      next: { x: leftNext, y: nextY },
      skip: { x: leftSkip, y: skipY },
    };
  }

  /**
   * Check if an element is visible in the viewport.
   */
  isElementInViewport(selector: string): boolean {
    const el = document.querySelector(selector);
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.bottom <= (this.getViewportSize().vh || document.documentElement.clientHeight)
    );
  }

  /**
   * Generate SVG quadratic bezier path for the arrow.
   */
  generateArrowPath(arrow: ArrowData): string {
    let cpX: number;
    let cpY: number;

    if (arrow.orientation === 'hor') {
      cpX = arrow.xTo;
      cpY = arrow.yFrom;
    } else {
      cpX = arrow.xFrom;
      cpY = arrow.yTo;
    }

    return `M${arrow.xFrom},${arrow.yFrom} Q${cpX},${cpY} ${arrow.xTo},${arrow.yTo}`;
  }
}
