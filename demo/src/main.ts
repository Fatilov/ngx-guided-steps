import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { AppComponent } from './app/app.component';
import { provideGuidedSteps, GUIDED_STEPS_ROUTER } from '../../projects/ngx-guided-steps/src/public-api';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideGuidedSteps({
      backgroundColor: 'rgba(0,0,0,0.65)',
      showProgress: true,
      keyboardNav: true,
      labels: {
        next: 'Suivant',
        prev: 'Precedent',
        skip: 'Passer',
        close: 'Fermer',
        progress: '{{current}} / {{total}}',
        stepLabel: 'Etape {{current}} sur {{total}}',
        stepAnnouncement: 'Etape {{current}} sur {{total}} : {{description}}',
      },
    }),
    { provide: GUIDED_STEPS_ROUTER, useExisting: Router },
  ],
}).catch((err) => console.error(err));
