import { Component, inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WanejoyhintService, WanejoyhintStep } from '../../../../projects/wanejoyhint/src/public-api';

@Component({
  selector: 'app-advanced',
  standalone: true,
  template: `
    <!-- Section: i18n -->
    <section class="section section-white" id="section-i18n">
      <div class="container">
        <h2>Internationalisation (i18n)</h2>
        <p class="section-desc">Personnalisez tous les textes de l'interface via l'option <code>labels</code>.</p>
        <div class="demo-row">
          <div class="demo-card" id="demo-i18n-target">
            <h4>Element cible</h4>
            <p>Les boutons du tour utilisent des labels francais.</p>
          </div>
          <div class="demo-card code-card">
            <pre><code [innerHTML]="i18nCodeSnippet"></code></pre>
          </div>
        </div>
        <button class="btn btn-primary" id="btn-i18n" (click)="startI18nTour()">Lancer le tour i18n</button>
      </div>
    </section>

    <!-- Section: Themes -->
    <section class="section section-gray" id="section-themes">
      <div class="container">
        <h2>Themes : Light &amp; Dark</h2>
        <p class="section-desc">Basculez entre le theme clair et sombre via <code>theme: 'light' | 'dark'</code>.</p>
        <div class="demo-row">
          <div class="demo-card theme-preview light-preview" id="demo-theme-light">
            <h4>Theme Light</h4>
            <p>Boutons blancs sur overlay sombre (defaut)</p>
          </div>
          <div class="demo-card theme-preview dark-preview" id="demo-theme-dark">
            <h4>Theme Dark</h4>
            <p>Boutons sombres sur overlay clair</p>
          </div>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary" id="btn-theme-light" (click)="startThemeTour('light')">Tour Light</button>
          <button class="btn btn-secondary" id="btn-theme-dark" (click)="startThemeTour('dark')">Tour Dark</button>
        </div>
      </div>
    </section>

    <!-- Section: Modals + waitForSelector -->
    <section class="section section-white" id="section-modals">
      <div class="container">
        <h2>Modals &amp; waitForSelector</h2>
        <p class="section-desc">Le tour attend qu'un element apparaisse dans le DOM grace a <code>waitForSelector</code>.</p>
        <div class="demo-row">
          <button class="btn btn-primary" id="btn-modal-tour" (click)="startModalTour()">Lancer le tour Modal</button>
          <button class="btn btn-secondary" id="btn-toggle-modal" (click)="toggleModal()">
            {{ modalOpen ? 'Fermer' : 'Ouvrir' }} le modal
          </button>
        </div>
        @if (modalOpen) {
          <div class="modal-backdrop" (click)="toggleModal()">
            <div class="modal-dialog" (click)="$event.stopPropagation()">
              <div class="modal-header" id="demo-modal-header">
                <h4>Modal de demonstration</h4>
                <button class="modal-close" (click)="toggleModal()">&times;</button>
              </div>
              <div class="modal-body" id="demo-modal-body">
                <p>Cet element est apparu dynamiquement.</p>
                <p>Le tour a attendu son apparition grace a <code>waitForSelector</code>.</p>
              </div>
              <div class="modal-footer" id="demo-modal-footer">
                <button class="btn btn-small btn-primary" (click)="toggleModal()">Fermer</button>
              </div>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- Section: Cross-route -->
    <section class="section section-gray" id="section-cross-route">
      <div class="container">
        <h2>Navigation cross-routes</h2>
        <p class="section-desc">Un tour peut naviguer entre plusieurs pages grace au token <code>WANEJOYHINT_ROUTER</code>.</p>
        <div class="demo-row">
          <div class="demo-card" id="demo-cross-start">
            <h4>Depart : page Avance</h4>
            <p>Le tour commence ici, puis navigue vers <b>/dashboard</b>.</p>
          </div>
          <div class="demo-card code-card">
            <pre><code [innerHTML]="crossRouteCodeSnippet"></code></pre>
          </div>
        </div>
        <button class="btn btn-primary" id="btn-cross-route" (click)="startCrossRouteTour()">Lancer le tour Cross-route</button>
      </div>
    </section>

    <!-- Section: Backdrop dismiss + Keyboard -->
    <section class="section section-white" id="section-backdrop">
      <div class="container">
        <h2>Backdrop dismiss &amp; Navigation clavier</h2>
        <p class="section-desc">
          <code>backdropDismiss: true</code> permet de fermer en cliquant l'overlay.
          <code>keyboardNav: true</code> active les fleches gauche/droite.
        </p>
        <div class="demo-row">
          <div class="demo-card" id="demo-backdrop-1">
            <h4>Element A</h4>
            <p>Cliquez l'overlay sombre pour fermer</p>
          </div>
          <div class="demo-card" id="demo-backdrop-2">
            <h4>Element B</h4>
            <p>Ou utilisez ← → pour naviguer</p>
          </div>
          <div class="demo-card" id="demo-backdrop-3">
            <h4>Element C</h4>
            <p>Echap ferme aussi le tour</p>
          </div>
        </div>
        <button class="btn btn-primary" id="btn-backdrop" (click)="startBackdropTour()">Lancer le tour Backdrop + Clavier</button>
      </div>
    </section>

    <!-- Log -->
    <section class="section section-dark">
      <div class="container">
        <h3>Journal des evenements</h3>
        <div class="log-output" id="adv-log-output">
          @for (entry of logs; track $index) {
            <div class="log-entry" [class.log-info]="entry.type==='info'" [class.log-success]="entry.type==='success'" [class.log-warn]="entry.type==='warn'">
              {{ entry.time }} — {{ entry.message }}
            </div>
          } @empty {
            <div class="log-placeholder">Lancez un tour pour voir les evenements...</div>
          }
        </div>
        <button class="btn btn-small" style="margin-top:8px" (click)="logs=[]">Vider</button>
      </div>
    </section>
  `,
  styles: [`
    .section { padding: 48px 0; }
    .section-white { background: white; }
    .section-gray { background: #f5f7fa; }
    .section-dark { background: #1a1a2e; color: white; }
    .container { max-width: 900px; margin: 0 auto; padding: 0 20px; }

    h2 { font-size: 1.5em; margin-bottom: 6px; color: #1a1a2e; }
    h3 { margin-bottom: 12px; }
    h4 { margin-bottom: 6px; color: #333; font-size: 0.95em; }
    .section-desc { color: #666; margin-bottom: 24px; font-size: 14px; }
    .section-desc code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 13px; }

    .demo-row {
      display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; align-items: stretch;
    }

    .demo-card {
      background: white; border-radius: 12px; padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06); flex: 1 1 200px; min-width: 180px;
    }
    .section-gray .demo-card { background: white; }
    .demo-card p { font-size: 13px; color: #888; }

    .code-card {
      background: #0d1117; color: #c9d1d9; font-size: 12px;
      font-family: 'Fira Code', 'Courier New', monospace;
    }
    .code-card pre { margin: 0; white-space: pre-wrap; }
    .code-card code { color: #c9d1d9; }

    .theme-preview {
      border: 2px solid transparent; transition: border-color 0.2s; text-align: center;
    }
    .light-preview { border-color: #e0e0e0; }
    .dark-preview { background: #2d2d44; border-color: #444; }
    .dark-preview h4, .dark-preview p { color: #ddd !important; }

    .btn {
      padding: 10px 20px; border: 2px solid #1ecd97; border-radius: 25px;
      background: transparent; color: #1ecd97; font-size: 14px; cursor: pointer;
      font-weight: 500; transition: all 0.2s; text-align: center;
    }
    .btn:hover { background: #1ecd97; color: white; }
    .btn-primary { border-color: #1ecd97; color: #1ecd97; }
    .btn-primary:hover { background: #1ecd97; }
    .btn-secondary { border-color: #6c63ff; color: #6c63ff; }
    .btn-secondary:hover { background: #6c63ff; color: white; }
    .btn-small { padding: 6px 14px; font-size: 12px; }
    .btn-group { display: flex; gap: 12px; flex-wrap: wrap; }

    /* Modal styles */
    .modal-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex; align-items: center;
      justify-content: center; z-index: 900;
    }
    .modal-dialog {
      background: white; border-radius: 14px; width: 90%; max-width: 440px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.25); overflow: hidden;
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; border-bottom: 1px solid #eee;
    }
    .modal-header h4 { margin: 0; color: #1a1a2e; }
    .modal-close {
      background: none; border: none; font-size: 22px; cursor: pointer;
      color: #999; padding: 0 4px; line-height: 1;
    }
    .modal-body { padding: 20px; }
    .modal-body p { color: #555; font-size: 14px; margin-bottom: 8px; }
    .modal-body code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .modal-footer { padding: 12px 20px; border-top: 1px solid #eee; text-align: right; }

    .log-output {
      background: #0d1117; padding: 14px; border-radius: 8px;
      max-height: 160px; overflow-y: auto; font-family: 'Fira Code', monospace;
      font-size: 12px; color: #cdd6f4;
    }
    .log-entry { padding: 2px 0; }
    .log-info { color: #89b4fa; }
    .log-success { color: #a6e3a1; }
    .log-warn { color: #fab387; }
    .log-placeholder { color: #585b70; font-style: italic; }

    @media (max-width: 640px) {
      .section { padding: 32px 0; }
      h2 { font-size: 1.2em; }
      .demo-row { gap: 10px; }
      .demo-card { flex: 1 1 100%; }
      .btn { font-size: 13px; padding: 8px 16px; }
    }
  `],
})
export class AdvancedComponent implements OnDestroy {
  hint = inject(WanejoyhintService);
  logs: { time: string; message: string; type: 'info' | 'success' | 'warn' }[] = [];
  modalOpen = false;
  private subs: Subscription[] = [];

  i18nCodeSnippet = `labels: {\n  next: 'Suivant',\n  prev: 'Precedent',\n  skip: 'Passer',\n  progress: '{{current}} sur {{total}}'\n}`;
  crossRouteCodeSnippet = `{ selector: '#dashboard-stats',\n  route: '/dashboard',\n  waitForSelector: true }`;

  constructor() {
    this.subs.push(
      this.hint.onStepChange.subscribe(({ index, step }) => this.log(`Step ${index + 1}: ${step.selector}`, 'info')),
      this.hint.onEnd.subscribe(() => this.log('Tour termine', 'success')),
      this.hint.onSkip.subscribe(() => this.log('Tour passe (skip/backdrop/Echap)', 'warn')),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.hint.stop();
  }

  private log(message: string, type: 'info' | 'success' | 'warn'): void {
    const time = new Date().toLocaleTimeString('fr-FR', { hour12: false });
    this.logs.unshift({ time, message, type });
  }

  toggleModal(): void {
    this.modalOpen = !this.modalOpen;
  }

  // ---- i18n ----
  startI18nTour(): void {
    this.log('--- Tour i18n ---', 'info');
    this.hint.setConfig({
      labels: {
        next: 'Suivant',
        prev: 'Precedent',
        skip: 'Passer le tour',
        progress: '{{current}} sur {{total}}',
      },
      showProgress: true,
    });
    this.hint.setSteps([
      { selector: '#demo-i18n-target', description: 'Les boutons affichent <b>Suivant</b>, <b>Precedent</b>, <b>Passer</b>.', eventType: 'next' },
      { selector: '#section-i18n', description: 'Le <b>progres</b> affiche "X sur Y" au lieu de "X / Y".', eventType: 'next', showPrev: true },
    ]);
    this.hint.run({ onEnd: () => this.log('Tour i18n termine', 'success') });
  }

  // ---- THEMES ----
  startThemeTour(theme: 'light' | 'dark'): void {
    this.log(`--- Tour Theme ${theme} ---`, 'info');
    this.hint.setConfig({
      theme,
      backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.85)' : undefined,
      showProgress: true,
    });
    this.hint.setSteps([
      {
        selector: theme === 'light' ? '#demo-theme-light' : '#demo-theme-dark',
        description: `Theme <b>${theme}</b> actif. Observez le style des boutons et du fond.`,
        eventType: 'next',
      },
      {
        selector: '#section-themes',
        description: `Le theme <b>${theme}</b> s'applique a tous les elements du tour.`,
        eventType: 'next',
        showPrev: true,
      },
    ]);
    this.hint.run({ onEnd: () => this.log(`Tour Theme ${theme} termine`, 'success') });
  }

  // ---- MODALS + waitForSelector ----
  startModalTour(): void {
    this.log('--- Tour Modal ---', 'info');
    this.hint.setConfig({ showProgress: true });
    this.hint.setSteps([
      {
        selector: '#btn-toggle-modal',
        description: '<b>Cliquez</b> sur ce bouton pour ouvrir le modal. Le tour attend...',
        eventType: 'click',
        showNext: false,
      },
      {
        selector: '#demo-modal-header',
        description: 'Le tour a <b>attendu</b> l\'apparition du modal grace a <code>waitForSelector</code>.',
        eventType: 'next',
        waitForSelector: 5000,
      },
      {
        selector: '#demo-modal-body',
        description: 'On peut cibler n\'importe quel element <b>a l\'interieur</b> du modal.',
        eventType: 'next',
        showPrev: true,
      },
      {
        selector: '#demo-modal-footer',
        description: 'Derniere etape dans le modal. Cliquez <b>Suivant</b> pour terminer.',
        eventType: 'next',
        showPrev: true,
      },
    ]);
    this.hint.run({
      onEnd: () => {
        this.modalOpen = false;
        this.log('Tour Modal termine', 'success');
      },
    });
  }

  // ---- CROSS-ROUTE ----
  startCrossRouteTour(): void {
    this.log('--- Tour Cross-route ---', 'info');
    this.hint.setConfig({ showProgress: true });
    this.hint.setSteps([
      {
        selector: '#demo-cross-start',
        description: 'On commence sur la page <b>Avance</b>. Le prochain step navigue vers /dashboard.',
        eventType: 'next',
      },
      {
        selector: '#dashboard-header',
        description: 'Bienvenue sur le <b>Dashboard</b> ! La navigation a ete faite automatiquement.',
        eventType: 'next',
        route: '/dashboard',
        waitForSelector: true,
      },
      {
        selector: '#dashboard-stats',
        description: 'On peut cibler les elements du <b>Dashboard</b> depuis le tour.',
        eventType: 'next',
        showPrev: true,
      },
      {
        selector: '#dashboard-chart',
        description: 'Le graphique du dashboard. Cliquez <b>Suivant</b> pour revenir.',
        eventType: 'next',
        showPrev: true,
      },
      {
        selector: '#section-cross-route',
        description: 'De retour sur la page <b>Avance</b>. Navigation cross-route terminee !',
        eventType: 'next',
        route: '/advanced',
        waitForSelector: true,
        showPrev: true,
      },
    ]);
    this.hint.run({ onEnd: () => this.log('Tour Cross-route termine', 'success') });
  }

  // ---- BACKDROP DISMISS + KEYBOARD ----
  startBackdropTour(): void {
    this.log('--- Tour Backdrop + Clavier ---', 'info');
    this.hint.setConfig({
      backdropDismiss: true,
      keyboardNav: true,
      showProgress: true,
    });
    this.hint.setSteps([
      {
        selector: '#demo-backdrop-1',
        description: 'Cliquez sur l\'<b>overlay sombre</b> pour fermer, ou utilisez <b>→</b> pour avancer.',
        eventType: 'next',
      },
      {
        selector: '#demo-backdrop-2',
        description: 'Fleche <b>←</b> pour reculer, <b>→</b> pour avancer, <b>Echap</b> pour quitter.',
        eventType: 'next',
        showPrev: true,
      },
      {
        selector: '#demo-backdrop-3',
        description: 'Dernier element. Essayez le <b>backdrop dismiss</b> ou la touche <b>Echap</b>.',
        eventType: 'next',
        showPrev: true,
      },
    ]);
    this.hint.run({
      onEnd: () => this.log('Tour Backdrop termine', 'success'),
      onSkip: () => this.log('Tour ferme via backdrop ou Echap', 'warn'),
    });
  }
}
