import { Provider } from '@angular/core';
import { WanejoyhintConfig, WANEJOYHINT_CONFIG } from './models/wanejoyhint-config.model';

/**
 * Provide Wanejoyhint configuration at the application level.
 *
 * @example
 * ```typescript
 * // In app.config.ts
 * import { provideWanejoyhint } from 'wanejoyhint';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideWanejoyhint({
 *       backgroundColor: 'rgba(0,0,0,0.7)',
 *       nextButtonText: 'Suivant',
 *       skipButtonText: 'Passer',
 *     })
 *   ]
 * };
 * ```
 */
export function provideWanejoyhint(config?: WanejoyhintConfig): Provider[] {
  return config
    ? [{ provide: WANEJOYHINT_CONFIG, useValue: config }]
    : [];
}
