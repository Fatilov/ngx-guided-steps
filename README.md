# Wanejoyhint

Angular 18 interactive tutorial and hint library. Pure TypeScript, zero jQuery dependency.

Inspired by [EnjoyHint](https://github.com/xbsoftware/enjoyhint), rebuilt from scratch as a modern Angular library with standalone components, SVG-based overlays, and full mobile support.

**[Live Demo](https://wanejoyhint.vercel.app/)**

## Features

- SVG mask-based element highlighting (rect + circle shapes)
- Animated arrows pointing to target elements
- Step-by-step navigation (Next / Previous / Skip)
- Multiple event types: `next`, `click`, `key`, `custom`, `auto`
- Automatic scroll to off-screen elements
- Responsive design with mobile-first approach
- WCAG accessibility: `role="dialog"`, `aria-live`, focus trap, ESC to close
- Programmatic API: `next()`, `prev()`, `trigger()`, `reRun()`, `setCurrentStep()`
- RxJS observables: `onStepChange`, `onEnd`, `onSkip`
- Step-level callbacks: `onBeforeStart`
- Custom button text and CSS classes per step
- Custom arrow colors per step
- Zero external dependencies (only `@angular/core`, `@angular/common`, `rxjs`)

## Installation

```bash
npm install wanejoyhint
```

## Quick Start

```typescript
import { Component, inject } from '@angular/core';
import { WanejoyhintService, WanejoyhintStep } from 'wanejoyhint';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<button (click)="startTour()">Start Tour</button>`
})
export class AppComponent {
  private hint = inject(WanejoyhintService);

  startTour(): void {
    const steps: WanejoyhintStep[] = [
      {
        selector: '#welcome',
        description: '<b>Welcome!</b> This is the first step.',
        eventType: 'next',
      },
      {
        selector: '#feature',
        description: 'Click this element to continue.',
        eventType: 'click',
        showNext: false,
      },
      {
        selector: '#finish',
        description: 'All done!',
        eventType: 'next',
      },
    ];

    this.hint.setSteps(steps);
    this.hint.run({
      onStart: () => console.log('Tour started'),
      onEnd: () => console.log('Tour completed'),
      onSkip: () => console.log('Tour skipped'),
    });
  }
}
```

## API Reference

### WanejoyhintService

| Method | Description |
|--------|-------------|
| `setSteps(steps: WanejoyhintStep[])` | Configure the tutorial steps |
| `run(events?: WanejoyhintEvents)` | Start the tutorial |
| `stop()` | Stop and remove the overlay |
| `next()` | Advance to the next step |
| `prev()` | Go back to the previous step |
| `trigger(eventName: string)` | Trigger a custom event or advance |
| `reRun(fromStep: number)` | Restart from a specific step |
| `setCurrentStep(index: number)` | Set the current step index |
| `getCurrentStep(): number` | Get the current step index |
| `isRunning: boolean` | Whether the tutorial is active |

### Observables

| Observable | Description |
|------------|-------------|
| `onStepChange` | Emits `{ index, step }` on each step change |
| `onEnd` | Emits when the tutorial completes |
| `onSkip` | Emits when the user skips |

### WanejoyhintStep

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `selector` | `string` | required | CSS selector of the target element |
| `description` | `string` | required | HTML content for the hint |
| `shape` | `'rect' \| 'circle'` | `'rect'` | Highlight shape |
| `radius` | `number` | auto | Circle radius or rect border-radius |
| `margin` | `number` | `10` | Margin around the highlighted element |
| `eventType` | `'next' \| 'click' \| 'key' \| 'custom' \| 'auto'` | `'next'` | Event to advance |
| `key` | `string` | - | Key name for `key` event (e.g. `'Enter'`) |
| `keyCode` | `number` | - | Key code (deprecated, use `key`) |
| `showNext` | `boolean` | depends | Show the Next button |
| `showPrev` | `boolean` | depends | Show the Previous button |
| `showSkip` | `boolean` | `true` | Show the Skip button |
| `timeout` | `number` | - | Delay in ms before showing this step |
| `arrowColor` | `string` | `'white'` | CSS color for the arrow |
| `nextButton` | `{ text?, className? }` | - | Custom Next button config |
| `prevButton` | `{ text?, className? }` | - | Custom Previous button config |
| `skipButton` | `{ text?, className? }` | - | Custom Skip button config |
| `onBeforeStart` | `() => void` | - | Callback before this step starts |
| `top/bottom/left/right` | `number` | `0` | Offset adjustments for the highlight |

### Global Configuration

Provide `WANEJOYHINT_CONFIG` to customize defaults:

```typescript
import { WANEJOYHINT_CONFIG } from 'wanejoyhint';

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: WANEJOYHINT_CONFIG,
      useValue: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        nextButtonText: 'Suivant',
        prevButtonText: 'Precedent',
        skipButtonText: 'Passer',
        zIndex: 2000,
      }
    }
  ]
});
```

## Requirements

- Angular 18+
- RxJS 7+

## License

MIT
