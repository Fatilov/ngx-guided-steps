import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideWanejoyhint } from '../../projects/wanejoyhint/src/public-api';

bootstrapApplication(AppComponent, {
  providers: [
    provideWanejoyhint({
      backgroundColor: 'rgba(0,0,0,0.65)',
      nextButtonText: 'Suivant',
      skipButtonText: 'Passer',
      prevButtonText: 'Precedent',
    }),
  ],
}).catch((err) => console.error(err));
