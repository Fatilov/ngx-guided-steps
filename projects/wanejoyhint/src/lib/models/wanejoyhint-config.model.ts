import { InjectionToken } from '@angular/core';

/**
 * Labels for all UI text in the overlay. Allows full i18n support.
 */
export interface WanejoyhintLabels {
  /** Text for the Next button (default: 'Next') */
  next?: string;
  /** Text for the Previous button (default: 'Previous') */
  prev?: string;
  /** Text for the Skip button (default: 'Skip') */
  skip?: string;
  /** Aria-label for the close button (default: 'Close tutorial') */
  close?: string;
  /** Progress text template. Use {{current}} and {{total}} as placeholders (default: '{{current}} / {{total}}') */
  progress?: string;
  /** Aria-label template for the dialog. Use {{current}} and {{total}} (default: 'Step {{current}} of {{total}}') */
  stepLabel?: string;
  /** Screen reader announcement template. Use {{current}}, {{total}}, {{description}} (default: 'Step {{current}} of {{total}}: {{description}}') */
  stepAnnouncement?: string;
}

export const DEFAULT_LABELS: Required<WanejoyhintLabels> = {
  next: 'Next',
  prev: 'Previous',
  skip: 'Skip',
  close: 'Close tutorial',
  progress: '{{current}} / {{total}}',
  stepLabel: 'Step {{current}} of {{total}}',
  stepAnnouncement: 'Step {{current}} of {{total}}: {{description}}',
};

/**
 * Visual theme for the overlay.
 * - 'light': light-colored buttons and text (default, for dark overlays)
 * - 'dark': dark-colored buttons and text (for light overlays)
 */
export type WanejoyhintTheme = 'light' | 'dark';

/**
 * Global configuration for the Wanejoyhint library.
 */
export interface WanejoyhintConfig {
  /** Background color of the overlay (default: 'rgba(0,0,0,0.6)') */
  backgroundColor?: string;

  /** @deprecated Use labels.next instead */
  nextButtonText?: string;

  /** @deprecated Use labels.skip instead */
  skipButtonText?: string;

  /** @deprecated Use labels.prev instead */
  prevButtonText?: string;

  /** Z-index base for the overlay (default: 1010) */
  zIndex?: number;

  /** Default animation time in ms (default: 800) */
  animationTime?: number;

  /** Show step progress indicator e.g. "2 / 5" (default: false) */
  showProgress?: boolean;

  /** Customizable UI labels for i18n support */
  labels?: WanejoyhintLabels;

  /** Visual theme: 'light' (default) or 'dark' */
  theme?: WanejoyhintTheme;
}

export const DEFAULT_CONFIG: WanejoyhintConfig = {
  backgroundColor: 'rgba(0,0,0,0.6)',
  nextButtonText: 'Next',
  skipButtonText: 'Skip',
  prevButtonText: 'Previous',
  zIndex: 1010,
  animationTime: 800,
  showProgress: false,
  theme: 'light',
};

export const WANEJOYHINT_CONFIG = new InjectionToken<WanejoyhintConfig>(
  'WANEJOYHINT_CONFIG'
);
