# Changelog

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
- Global configuration via `WANEJOYHINT_CONFIG` injection token
- `key` property on step model (modern replacement for deprecated `keyCode`)
- Angular 18 modern patterns: `inject()`, `@if`/`@for` control flow
- Unit tests with Jest (39 tests)
- E2E tests with Playwright across 7 device viewports (173 tests)
- CI workflow with unit tests and library build
- Demo application deployed on Vercel
