# Changelog

## [1.1.0] - 2026-03-28

### Added
- **i18n support**: New `GuidedStepsLabels` interface for full UI text customization
  - Configurable labels: `next`, `prev`, `skip`, `close`, `progress`, `stepLabel`, `stepAnnouncement`
  - Template interpolation with `{{current}}`, `{{total}}`, `{{description}}` placeholders
- **Theme support**: `theme` config option (`'light'` or `'dark'`) for visual theme switching
  - Dark theme inverts button colors, text, and close button for light-background overlays
- **Keyboard navigation**: Arrow keys left/right to navigate between steps (`keyboardNav` config, default: true)
- **Auto-advance**: `autoAdvance` step property with visible countdown timer, cancelled on manual interaction
- **Backdrop dismiss**: `backdropDismiss` config option to close the tour by clicking the overlay
- **Smooth step transitions**: CSS fade animation between step changes
- **CSS custom properties documentation**: Full reference for theming via CSS variables
- **Complete developer guide**: README rewritten as a step-by-step guide in French (installation to integration)
- Unit tests: 48 total (up from 39)

### Changed
- Button text now sourced from `labels` (with backwards compat for `nextButtonText`, etc.)
- Dialog `aria-label` and screen reader announcements use configurable label templates
- Close button `aria-label` is now configurable via `labels.close`

### Deprecated
- `nextButtonText`, `prevButtonText`, `skipButtonText` config options (use `labels.next`, `labels.prev`, `labels.skip` instead)

## [1.0.0] - 2026-03-28

### Added
- Angular 18 standalone library built from scratch (pure TypeScript, zero jQuery)
- SVG mask-based element highlighting with rect and circle shapes
- Animated arrow paths pointing to target elements
- Step-by-step navigation with Next, Previous, and Skip buttons
- Multiple event types: `next`, `click`, `key`, `custom`, `auto`
- Automatic scroll to off-screen elements with `scrollIntoView`
- Responsive mobile-first design with breakpoints at 640px and 960px
- WCAG accessibility: `role="dialog"`, `aria-modal`, `aria-live` announcements, focus trap, ESC to close, `focus-visible` indicators
- Native `<button>` elements for all interactive controls
- Programmatic API: `next()`, `prev()`, `trigger()`, `reRun()`, `setCurrentStep()`
- RxJS observables: `onStepChange`, `onEnd`, `onSkip`
- Step-level callbacks: `onBeforeStart`
- Custom button text and CSS classes per step
- Custom arrow colors per step
- Global configuration via `GUIDED_STEPS_CONFIG` injection token
- `key` property on step model (modern replacement for deprecated `keyCode`)
- Angular 18 modern patterns: `inject()`, `@if`/`@for` control flow
- Unit tests with Jest (39 tests)
- E2E tests with Playwright across 7 device viewports (173 tests)
- CI workflow with unit tests and library build
- Demo application deployed on Vercel
