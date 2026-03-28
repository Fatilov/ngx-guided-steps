import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { AppComponent } from './app/app.component';
import { provideWanejoyhint, WANEJOYHINT_ROUTER } from '../../projects/wanejoyhint/src/public-api';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideWanejoyhint({
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
    { provide: WANEJOYHINT_ROUTER, useExisting: Router },
  ],
}).catch((err) => console.error(err));
