/**
 * Configuration for a single tutorial step.
 */
export interface WanejoyhintStep {
  /** CSS selector of the target element to highlight */
  selector: string;

  /** HTML content for the hint description */
  description: string;

  /** Shape of the highlight area */
  shape?: 'rect' | 'circle';

  /** Border radius for the highlight cutout (default: 0 for rect, auto for circle) */
  radius?: number;

  /** Margin around the highlighted element in px */
  margin?: number;

  /**
   * Event that triggers moving to the next step.
   * - 'next': user clicks the Next button (default)
   * - 'click': user clicks the highlighted element
   * - 'key': user presses a specific key (requires keyCode)
   * - 'custom': programmatic trigger via service
   * - 'auto': automatically trigger the event and move on
   */
  eventType?: 'next' | 'click' | 'key' | 'custom' | 'auto';

  /** Alternate CSS selector for the element that receives the event */
  eventSelector?: string;

  /** Key code for 'key' event type (deprecated, use key instead) */
  keyCode?: number;

  /** Key name for 'key' event type (e.g. 'Enter', 'Escape') */
  key?: string;

  /** Show the Next button (default: depends on eventType) */
  showNext?: boolean;

  /** Show the Previous button (default: true except for step 0) */
  showPrev?: boolean;

  /** Show the Skip button (default: true) */
  showSkip?: boolean;

  /** Delay in ms before showing this step */
  timeout?: number;

  /** Speed of scroll animation in ms (default: 250) */
  scrollAnimationSpeed?: number;

  /** Custom Next button configuration */
  nextButton?: StepButtonConfig;

  /** Custom Previous button configuration */
  prevButton?: StepButtonConfig;

  /** Custom Skip button configuration */
  skipButton?: StepButtonConfig;

  /** Color of the arrow (CSS color string, default: white) */
  arrowColor?: string;

  /** Offset adjustments for the highlight shape */
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;

  /** Callback fired before this step starts */
  onBeforeStart?: () => void;

  /** Callback fired when user clicks Next on this step */
  onNext?: () => void;

  /** Callback fired when user clicks Previous on this step */
  onPrev?: () => void;

  /** Callback fired when user clicks Skip on this step */
  onSkip?: () => void;
}

export interface StepButtonConfig {
  text?: string;
  className?: string;
}

/**
 * Internal resolved step data with computed positions.
 */
export interface ResolvedStepData {
  step: WanejoyhintStep;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  radius: number;
  shape: 'rect' | 'circle';
}
