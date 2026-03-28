import { InjectionToken } from '@angular/core';

/**
 * Global configuration for the Wanejoyhint library.
 */
export interface WanejoyhintConfig {
  /** Background color of the overlay (default: 'rgba(0,0,0,0.6)') */
  backgroundColor?: string;

  /** Default text for the Next button */
  nextButtonText?: string;

  /** Default text for the Skip button */
  skipButtonText?: string;

  /** Default text for the Previous button */
  prevButtonText?: string;

  /** Z-index base for the overlay (default: 1010) */
  zIndex?: number;

  /** Default animation time in ms (default: 800) */
  animationTime?: number;
}

export const DEFAULT_CONFIG: WanejoyhintConfig = {
  backgroundColor: 'rgba(0,0,0,0.6)',
  nextButtonText: 'Next',
  skipButtonText: 'Skip',
  prevButtonText: 'Previous',
  zIndex: 1010,
  animationTime: 800,
};

export const WANEJOYHINT_CONFIG = new InjectionToken<WanejoyhintConfig>(
  'WANEJOYHINT_CONFIG'
);
