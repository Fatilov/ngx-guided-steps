/*
 * ngx-guided-steps - Angular Interactive Tutorial Library
 * Inspired by EnjoyHint, built for Angular 18+
 *
 * Public API Surface
 */

// Models
export { GuidedStep, StepButtonConfig } from './lib/models/step.model';
export { GuidedStepsConfig, GuidedStepsLabels, GuidedStepsTheme, GuidedStepsRouter, GUIDED_STEPS_CONFIG, GUIDED_STEPS_ROUTER } from './lib/models/config.model';

// Services
export { GuidedStepsService, GuidedStepsEvents } from './lib/services/guided-steps.service';
export { PositionService } from './lib/services/position.service';

// Component
export { GuidedStepsOverlayComponent } from './lib/components/overlay.component';

// Provider
export { provideGuidedSteps } from './lib/guided-steps.provider';
