import { Provider } from '@angular/core';
import { GuidedStepsConfig, GUIDED_STEPS_CONFIG } from './models/config.model';

/**
 * Provide GuidedSteps configuration at the application level.
 *
 * @example
 * ```typescript
 * // In app.config.ts
 * import { provideGuidedSteps } from 'ngx-guided-steps';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideGuidedSteps({
 *       backgroundColor: 'rgba(0,0,0,0.7)',
 *       nextButtonText: 'Suivant',
 *       skipButtonText: 'Passer',
 *     })
 *   ]
 * };
 * ```
 */
export function provideGuidedSteps(config?: GuidedStepsConfig): Provider[] {
  return config
    ? [{ provide: GUIDED_STEPS_CONFIG, useValue: config }]
    : [];
}
