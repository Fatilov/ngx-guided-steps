import { ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WanejoyhintService } from '../../../../projects/wanejoyhint/src/public-api';

@Component({
  selector: 'app-features',
  standalone: true,
  template: `
    <!-- Hero bar -->
    <div class="hero-bar">
      <div class="container hero-bar-inner">
        <div>
          <h1>Parcours complet</h1>
          <p>Un seul tour, <b>toutes</b> les fonctionnalites de Wanejoyhint.</p>
        </div>
        <button class="btn btn-start" id="btn-start-tour" (click)="startTour()">
          &#9654; Lancer le tour
        </button>
      </div>
    </div>

    <!-- 1. Shapes -->
    <section class="section section-white" id="section-shapes">
      <div class="container">
        <h2>1. Formes et decoupes</h2>
        <p class="section-desc">Decoupe SVG <code>circle</code> ou <code>rect</code>, avec marge optionnelle.</p>
        <div class="demo-row">
          <div class="demo-card card-center" id="demo-avatar">
            <div class="avatar">AB</div>
            <span>Avatar (circle)</span>
          </div>
          <div class="demo-card" id="demo-card">
            <h4>Carte</h4>
            <p>Rectangle par defaut</p>
          </div>
          <div class="demo-card" id="demo-input-wrap">
            <input type="text" id="demo-input" class="demo-input" placeholder="Champ texte (rect + margin)">
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Events -->
    <section class="section section-gray" id="section-events">
      <div class="container">
        <h2>2. Types d'evenements</h2>
        <p class="section-desc"><code>click</code>, <code>key</code>, <code>custom</code> et <code>next</code>.</p>
        <div class="demo-row">
          <button class="btn btn-accent" id="demo-click-btn">Cliquer ici</button>
          <input type="text" id="demo-key-input" class="demo-input" placeholder="Appuyez Entree">
          <div class="demo-zone" id="demo-custom-zone">Zone custom (avance auto 3s)</div>
        </div>
      </div>
    </section>

    <!-- 3. Buttons -->
    <section class="section section-white" id="section-buttons">
      <div class="container">
        <h2>3. Boutons et couleurs</h2>
        <p class="section-desc">Texte personnalise, fleches colorees, boutons caches.</p>
        <div class="demo-row">
          <div class="demo-card" id="demo-custom-btns">
            <h4>Boutons custom</h4>
            <p>Texte et style modifies</p>
          </div>
          <div class="demo-card" id="demo-arrow-colors">
            <h4>Fleche rouge</h4>
            <p>arrowColor: #ff6b6b</p>
          </div>
          <div class="demo-card" id="demo-hidden-btns">
            <h4>Boutons caches</h4>
            <p>showSkip: false</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Scroll -->
    <section class="section section-gray" id="section-scroll">
      <div class="container">
        <h2>4. Scroll et viewport</h2>
        <p class="section-desc">Scroll automatique vers les elements hors ecran.</p>
        <div class="demo-card" id="demo-scroll-top">
          <h4>Element visible</h4>
          <p>Le tour scrolle vers l'element cache en dessous.</p>
        </div>
        <div class="spacer">&#8595; Espace vide — l'element cible est en dessous &#8595;</div>
        <div class="demo-card" id="demo-scroll-target">
          <h4>Element cache</h4>
          <p>Cet element etait hors du viewport.</p>
        </div>
      </div>
    </section>

    <!-- 5. Auto-advance -->
    <section class="section section-white" id="section-auto">
      <div class="container">
        <h2>5. Auto-avance (countdown)</h2>
        <p class="section-desc">Les etapes avancent automatiquement avec compteur a rebours.</p>
        <div class="demo-row">
          <div class="demo-card" id="demo-auto-1">
            <h4>Etape 1</h4>
            <p>Auto-avance 5s</p>
          </div>
          <div class="demo-card" id="demo-auto-2">
            <h4>Etape 2</h4>
            <p>Auto-avance 3s</p>
          </div>
          <div class="demo-card" id="demo-auto-3">
            <h4>Etape 3</h4>
            <p>Manuel</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. Themes -->
    <section class="section section-gray" id="section-themes">
      <div class="container">
        <h2>6. Themes</h2>
        <p class="section-desc">Theme <code>light</code> (defaut) et <code>dark</code>.</p>
        <div class="demo-row">
          <div class="demo-card theme-light" id="demo-theme-light">
            <h4>Theme Light</h4>
            <p>Boutons blancs sur overlay sombre</p>
          </div>
          <div class="demo-card theme-dark" id="demo-theme-dark">
            <h4>Theme Dark</h4>
            <p>Boutons sombres sur overlay clair</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 6b. i18n -->
    <section class="section section-white" id="section-i18n">
      <div class="container">
        <h2>6b. Internationalisation (i18n)</h2>
        <p class="section-desc">Changement dynamique des labels via <code>setConfig()</code>.</p>
        <div class="demo-row">
          <div class="demo-card" id="demo-i18n-fr">
            <h4>Francais</h4>
            <p>Suivant, Precedent, Passer</p>
          </div>
          <div class="demo-card" id="demo-i18n-en">
            <h4>English</h4>
            <p>Next, Previous, Skip</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. Modal -->
    <section class="section section-white" id="section-modal">
      <div class="container">
        <h2>7. Modal et waitForSelector</h2>
        <p class="section-desc">Le tour ouvre un modal via <code>onBeforeStart</code> et cible ses elements.</p>
        <button class="btn btn-secondary" id="btn-open-modal" (click)="modalOpen = true">Ouvrir le modal</button>
        @if (modalOpen) {
          <div class="modal-backdrop" (click)="modalOpen = false">
            <div class="modal-dialog" (click)="$event.stopPropagation()">
              <div class="modal-header" id="demo-modal-header">
                <h4>Modal de demonstration</h4>
                <button class="modal-close" (click)="modalOpen = false">&times;</button>
              </div>
              <div class="modal-body" id="demo-modal-body">
                <p>Cet element est apparu dynamiquement.</p>
                <p>Le tour a attendu son apparition grace a <code>waitForSelector</code>.</p>
              </div>
              <div class="modal-footer" id="demo-modal-footer">
                <button class="btn btn-small btn-primary" (click)="modalOpen = false">Fermer</button>
              </div>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- 7b. Cross-route -->
    <section class="section section-gray" id="section-crossroute">
      <div class="container">
        <h2>7b. Navigation cross-routes</h2>
        <p class="section-desc">Le tour navigue vers <code>/dashboard</code> puis revient.</p>
        <div class="demo-row">
          <div class="demo-card" id="demo-crossroute-info">
            <h4>Cross-route</h4>
            <p>Le tour va naviguer vers le Dashboard, cibler un element, puis revenir ici.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 8. API -->
    <section class="section section-gray" id="section-api">
      <div class="container">
        <h2>8. API programmatique</h2>
        <p class="section-desc">Controlez le tour par code : <code>next()</code>, <code>prev()</code>, <code>stop()</code>.</p>
        <div class="demo-row">
          <div class="demo-card api-card" id="demo-api-state">
            <h4>Etat du service</h4>
            <p>isRunning: <b>{{ hint.isRunning }}</b></p>
            <p>currentStep: <b>{{ hint.getCurrentStep() }}</b></p>
          </div>
          <div class="demo-card api-card" id="demo-api-controls">
            <h4>Controles</h4>
            <div class="btn-group">
              <button class="btn btn-small" (click)="hint.next()">next()</button>
              <button class="btn btn-small" (click)="hint.prev()">prev()</button>
              <button class="btn btn-small btn-accent" (click)="hint.stop()">stop()</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 9. Log -->
    <section class="section section-dark" id="section-log">
      <div class="container">
        <h2 style="color:white">9. Journal des evenements</h2>
        <p class="section-desc" style="color:rgba(255,255,255,0.6)">Tous les evenements du tour en temps reel.</p>
        <div class="log-output" id="log-output">
          @for (entry of logs; track $index) {
            <div class="log-entry" [class.log-info]="entry.type==='info'" [class.log-success]="entry.type==='success'" [class.log-warn]="entry.type==='warn'">
              {{ entry.time }} — {{ entry.message }}
            </div>
          } @empty {
            <div class="log-placeholder">Lancez le tour pour voir les evenements...</div>
          }
        </div>
        <button class="btn btn-small" style="margin-top:8px;border-color:rgba(255,255,255,0.3);color:rgba(255,255,255,0.6)" (click)="logs=[]">Vider</button>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .hero-bar {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 40px 0;
    }
    .hero-bar-inner {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 20px;
    }
    .hero-bar h1 { font-size: 1.8em; color: white; margin-bottom: 4px; }
    .hero-bar p { color: rgba(255,255,255,0.65); font-size: 15px; }
    .hero-bar p b { color: #1ecd97; }

    .btn-start {
      padding: 14px 32px; border: none; border-radius: 10px;
      background: #1ecd97; color: #0f1e17; font-size: 1rem;
      font-weight: 700; cursor: pointer; transition: all 0.2s;
      white-space: nowrap;
    }
    .btn-start:hover {
      background: #17b882; transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(30,205,151,0.35);
    }

    .section { padding: 48px 0; }
    .section-white { background: white; }
    .section-gray { background: #f5f7fa; }
    .section-dark { background: #1a1a2e; color: white; }
    .container { max-width: 900px; margin: 0 auto; padding: 0 20px; }

    h2 { font-size: 1.4em; margin-bottom: 6px; color: #1a1a2e; }
    h4 { margin-bottom: 6px; color: #333; font-size: 0.95em; }
    .section-desc { color: #666; margin-bottom: 24px; font-size: 14px; }
    .section-desc code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 13px; }

    .demo-row {
      display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; align-items: center;
    }

    .demo-card {
      background: white; border-radius: 12px; padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06); flex: 1 1 180px; min-width: 160px;
    }
    .section-gray .demo-card { background: white; }
    .demo-card p { font-size: 13px; color: #888; margin: 4px 0; }
    .card-center { text-align: center; }

    .avatar {
      width: 52px; height: 52px; border-radius: 50%; background: #6c63ff; color: white;
      display: inline-flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 18px; margin-bottom: 8px;
    }

    .demo-input {
      width: 100%; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 8px;
      font-size: 14px; outline: none; transition: border-color 0.2s;
    }
    .demo-input:focus { border-color: #1ecd97; }

    .demo-zone {
      padding: 16px 24px; border: 2px dashed #ccc; border-radius: 10px;
      color: #999; font-size: 13px; text-align: center; min-width: 160px;
    }

    .spacer {
      height: 600px; display: flex; align-items: center; justify-content: center;
      color: #bbb; font-size: 14px;
    }

    .theme-light { border: 2px solid #e0e0e0; }
    .theme-dark { background: #2d2d44; border: 2px solid #444; }
    .theme-dark h4, .theme-dark p { color: #ddd !important; }

    .api-card { flex: 1 1 200px; }

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
    .btn-accent { border-color: #ff6b6b; color: #ff6b6b; }
    .btn-accent:hover { background: #ff6b6b; color: white; }
    .btn-small { padding: 6px 14px; font-size: 12px; }
    .btn-group { display: flex; gap: 8px; flex-wrap: wrap; }

    /* Modal */
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
      max-height: 180px; overflow-y: auto; font-family: 'Fira Code', monospace;
      font-size: 12px; color: #cdd6f4;
    }
    .log-entry { padding: 2px 0; }
    .log-info { color: #89b4fa; }
    .log-success { color: #a6e3a1; }
    .log-warn { color: #fab387; }
    .log-placeholder { color: #585b70; font-style: italic; }

    @media (max-width: 640px) {
      .hero-bar { padding: 24px 0; }
      .hero-bar h1 { font-size: 1.3em; }
      .section { padding: 32px 0; }
      h2 { font-size: 1.2em; }
      .demo-row { gap: 10px; }
      .demo-card { flex: 1 1 100%; }
      .btn { font-size: 13px; padding: 8px 16px; }
    }
  `],
})
export class FeaturesComponent implements OnDestroy {
  hint = inject(WanejoyhintService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  logs: { time: string; message: string; type: 'info' | 'success' | 'warn' }[] = [];
  modalOpen = false;

  private subs: Subscription[] = [];
  private customTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.subs.push(
      this.hint.onStepChange.subscribe(({ index, step }) => {
        this.log(`Step ${index + 1}: ${step.selector}`, 'info');

        // Step 13 (index 12): custom event — programmatic next() after 3s
        if (index === 12) {
          this.clearCustomTimeout();
          this.customTimeout = setTimeout(() => {
            if (this.hint.isRunning) {
              this.log('custom: next() programmatique apres 3s', 'warn');
              this.hint.next();
            }
          }, 3000);
        }
      }),
      this.hint.onEnd.subscribe(() => this.log('Tour termine', 'success')),
      this.hint.onSkip.subscribe(() => this.log('Tour passe (skip)', 'warn')),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.clearCustomTimeout();
    this.hint.stop();
  }

  private clearCustomTimeout(): void {
    if (this.customTimeout) {
      clearTimeout(this.customTimeout);
      this.customTimeout = null;
    }
  }

  private log(message: string, type: 'info' | 'success' | 'warn'): void {
    const time = new Date().toLocaleTimeString('fr-FR', { hour12: false });
    this.logs.unshift({ time, message, type });
  }

  startTour(): void {
    this.logs = [];
    this.modalOpen = false;
    this.log('--- Demarrage du parcours complet ---', 'info');

    this.hint.setConfig({
      showProgress: true,
      labels: {
        next: 'Suivant',
        prev: 'Precedent',
        skip: 'Passer',
        progress: '{{current}} sur {{total}}',
      },
    });

    this.hint.setSteps([
      // Step 1: Welcome
      {
        selector: '#section-shapes',
        description: 'Bienvenue ! Ce tour couvre <b>toutes</b> les fonctionnalites de Wanejoyhint.',
        eventType: 'next',
      },
      // Step 2: Circle shape
      {
        selector: '#demo-avatar',
        description: 'Decoupe <b>circulaire</b> autour d\'un element.',
        shape: 'circle',
        eventType: 'next',
      },
      // Step 3: Rect shape with margin
      {
        selector: '#demo-input',
        description: 'Decoupe <b>rectangulaire</b> avec <b>margin: 20px</b>.',
        shape: 'rect',
        margin: 20,
        eventType: 'next',
        showPrev: true,
      },
      // Step 4: Click event
      {
        selector: '#demo-click-btn',
        description: '<b>Cliquez</b> sur ce bouton pour avancer.',
        eventType: 'click',
        showNext: false,
      },
      // Step 5: Key event (Enter)
      {
        selector: '#demo-key-input',
        description: 'Appuyez sur <b>Entree</b> pour avancer.',
        eventType: 'key',
        key: 'Enter',
        showNext: false,
      },
      // Step 6: Custom buttons + skip hidden
      {
        selector: '#demo-custom-btns',
        description: 'Boutons <b>personnalises</b> et skip cache.',
        eventType: 'next',
        nextButton: { text: 'Continuer >>' },
        showSkip: false,
        showPrev: true,
      },
      // Step 7: Arrow color
      {
        selector: '#demo-arrow-colors',
        description: 'Fleche <b style="color:#ff6b6b">rouge</b> personnalisee.',
        eventType: 'next',
        arrowColor: '#ff6b6b',
        showPrev: true,
      },
      // Step 8: Scroll to hidden element
      {
        selector: '#demo-scroll-target',
        description: 'Scroll <b>automatique</b> vers cet element !',
        eventType: 'next',
        showPrev: true,
        scrollAnimationSpeed: 300,
      },
      // Step 9: Scroll back
      {
        selector: '#demo-scroll-top',
        description: 'Et retour en haut.',
        eventType: 'next',
        showPrev: true,
        scrollAnimationSpeed: 300,
      },
      // Step 10: Auto-advance 5s
      {
        selector: '#demo-auto-1',
        description: 'Auto-avance dans <b>5 secondes</b>.',
        eventType: 'next',
        autoAdvance: 5000,
      },
      // Step 11: Auto-advance 3s
      {
        selector: '#demo-auto-2',
        description: 'Auto-avance dans <b>3 secondes</b>.',
        eventType: 'next',
        autoAdvance: 3000,
        showPrev: true,
      },
      // Step 12: Manual after auto
      {
        selector: '#demo-auto-3',
        description: 'Pas d\'auto-avance ici.',
        eventType: 'next',
        showPrev: true,
      },
      // Step 13: Custom event (programmatic next via timeout in onStepChange)
      {
        selector: '#demo-custom-zone',
        description: 'Etape <b>custom</b> — avance via next() dans 3s.',
        eventType: 'custom',
        showNext: false,
      },
      // Step 14: Timeout step
      {
        selector: '#demo-card',
        description: 'Etape avec <b>timeout: 500ms</b>.',
        eventType: 'next',
        timeout: 500,
        showPrev: true,
      },
      // Step 15: Switch to dark theme
      {
        selector: '#demo-theme-dark',
        description: 'Theme <b>dark</b> active via <code>setConfig()</code>.',
        eventType: 'next',
        showPrev: true,
        onBeforeStart: () => {
          this.hint.setConfig({
            theme: 'dark',
            backgroundColor: 'rgba(255,255,255,0.85)',
            showProgress: true,
            labels: {
              next: 'Suivant',
              prev: 'Precedent',
              skip: 'Passer',
              progress: '{{current}} sur {{total}}',
            },
          });
        },
      },
      // Step 16: Switch back to light theme
      {
        selector: '#demo-theme-light',
        description: 'Retour au theme <b>light</b> (defaut).',
        eventType: 'next',
        showPrev: true,
        onBeforeStart: () => {
          this.hint.setConfig({
            theme: 'light',
            backgroundColor: 'rgba(0,0,0,0.65)',
            showProgress: true,
            labels: {
              next: 'Suivant',
              prev: 'Precedent',
              skip: 'Passer',
              progress: '{{current}} sur {{total}}',
            },
          });
        },
      },
      // Step 17: i18n French labels (already active)
      {
        selector: '#demo-i18n-fr',
        description: 'Labels en <b>francais</b> : Suivant, Precedent, Passer.',
        eventType: 'next',
        showPrev: true,
      },
      // Step 18: Switch to English labels
      {
        selector: '#demo-i18n-en',
        description: 'Labels switched to <b>English</b>: Next, Previous, Skip.',
        eventType: 'next',
        showPrev: true,
        onBeforeStart: () => {
          this.hint.setConfig({
            showProgress: true,
            labels: {
              next: 'Next',
              prev: 'Previous',
              skip: 'Skip',
              progress: '{{current}} of {{total}}',
            },
          });
        },
      },
      // Step 19: onBeforeStart opens modal
      {
        selector: '#demo-modal-header',
        description: 'Le modal a ete ouvert via <b>onBeforeStart</b>.',
        eventType: 'next',
        waitForSelector: 3000,
        onBeforeStart: () => { this.modalOpen = true; this.cdr.detectChanges(); },
      },
      // Step 20: Inside modal
      {
        selector: '#demo-modal-body',
        description: 'Navigation a l\'interieur du modal.',
        eventType: 'next',
        showPrev: true,
      },
      // Step 21: API state (close modal first)
      {
        selector: '#demo-api-state',
        description: '<b>isRunning</b>: true, <b>currentStep</b>: visible en temps reel.',
        eventType: 'next',
        showPrev: true,
        onBeforeStart: () => { this.modalOpen = false; this.cdr.detectChanges(); },
      },
      // Step 22: Event log
      {
        selector: '#log-output',
        description: 'Journal des evenements en temps reel.',
        eventType: 'next',
        showPrev: true,
      },
      // Step 23: Navigate to dashboard
      {
        selector: '#dashboard-stats',
        route: '/dashboard',
        description: 'Navigation vers <b>/dashboard</b> ! Cet element est sur une autre page.',
        eventType: 'next',
        showPrev: true,
        waitForSelector: 5000,
        onBeforeStart: () => {
          this.hint.setConfig({
            showProgress: true,
            labels: {
              next: 'Suivant',
              prev: 'Precedent',
              skip: 'Passer',
              progress: '{{current}} sur {{total}}',
            },
          });
        },
      },
      // Step 24: Dashboard chart then navigate back
      {
        selector: '#dashboard-chart',
        description: 'Un autre element du <b>Dashboard</b>. On revient aux fonctionnalites.',
        eventType: 'next',
        showPrev: true,
      },
      // Step 25: Final - back to features
      {
        selector: '#section-shapes',
        route: '/features',
        description: 'Tour <b>complet</b> ! Toutes les fonctionnalites ont ete couvertes.',
        eventType: 'next',
        showPrev: true,
        waitForSelector: 5000,
      },
    ]);

    this.hint.run();
  }
}
