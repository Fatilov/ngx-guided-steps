import { Component, inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WanejoyhintService, WanejoyhintStep } from '../../../../projects/wanejoyhint/src/public-api';

@Component({
  selector: 'app-features',
  standalone: true,
  template: `
    <!-- Section: Formes et decoupes -->
    <section class="section section-white" id="section-shapes">
      <div class="container">
        <h2>Formes et decoupes</h2>
        <p class="section-desc">Decoupe SVG rectangulaire ou circulaire autour de n'importe quel element.</p>
        <div class="demo-row">
          <div class="demo-card" id="demo-avatar">
            <div class="avatar">AB</div>
            <span>Avatar (circle)</span>
          </div>
          <div class="demo-card" id="demo-badge">
            <span class="badge">5</span>
            <span>Badge (circle)</span>
          </div>
          <div class="demo-card" id="demo-card-rect">
            <h4>Carte</h4>
            <p>Rectangle avec margin</p>
          </div>
          <div class="demo-card" id="demo-input-wrap">
            <input type="text" id="demo-input" class="demo-input" placeholder="Champ texte (rect + margin)">
          </div>
        </div>
        <button class="btn btn-primary" id="btn-shapes" (click)="startShapesTour()">Lancer le tour Formes</button>
      </div>
    </section>

    <!-- Section: Types d'evenements -->
    <section class="section section-gray" id="section-events">
      <div class="container">
        <h2>Types d'evenements</h2>
        <p class="section-desc">5 facons de passer a l'etape suivante : next, click, key, custom, auto.</p>
        <div class="demo-row">
          <button class="btn btn-accent" id="demo-click-btn">Cliquer ici</button>
          <input type="text" id="demo-key-input" class="demo-input" placeholder="Appuyez Entree">
          <div class="demo-zone" id="demo-custom-zone">Attente custom</div>
          <button class="btn btn-secondary" id="demo-auto-btn">Auto-click</button>
        </div>
        <button class="btn btn-primary" id="btn-events" (click)="startEventsTour()">Lancer le tour Evenements</button>
      </div>
    </section>

    <!-- Section: Boutons et couleurs -->
    <section class="section section-white" id="section-buttons">
      <div class="container">
        <h2>Boutons et couleurs</h2>
        <p class="section-desc">Texte, classes CSS et couleurs de fleches personnalisables par etape.</p>
        <div class="demo-row">
          <div class="demo-card" id="demo-custom-btns">
            <h4>Boutons custom</h4>
            <p>Texte et style modifies</p>
          </div>
          <div class="demo-card" id="demo-colors">
            <h4>Fleche rouge</h4>
            <p>arrowColor: #ff6b6b</p>
          </div>
          <div class="demo-card" id="demo-hidden-btns">
            <h4>Boutons caches</h4>
            <p>showSkip: false</p>
          </div>
        </div>
        <button class="btn btn-primary" id="btn-buttons" (click)="startButtonsTour()">Lancer le tour Boutons</button>
      </div>
    </section>

    <!-- Section: Scroll et viewport -->
    <section class="section section-gray" id="section-scroll">
      <div class="container">
        <h2>Scroll et viewport</h2>
        <p class="section-desc">La bibliotheque scrolle automatiquement vers les elements hors ecran.</p>
        <div class="demo-card" id="demo-scroll-start">
          <h4>Element visible</h4>
          <p>Le tour commence ici, puis scroll vers l'element cache.</p>
        </div>
        <div style="height: 600px; display: flex; align-items: center; justify-content: center; color: #bbb; font-size: 14px;">
          ↓ Espace vide — l'element cible est en dessous ↓
        </div>
        <div class="demo-card" id="demo-scroll-target">
          <h4>Element cache</h4>
          <p>Cet element etait hors du viewport. Le tour y a scrolle automatiquement.</p>
        </div>
        <div style="height: 40px;"></div>
        <button class="btn btn-primary" id="btn-scroll" (click)="startScrollTour()">Lancer le tour Scroll</button>
      </div>
    </section>

    <!-- Section: API programmatique -->
    <section class="section section-white" id="section-api">
      <div class="container">
        <h2>API programmatique</h2>
        <p class="section-desc">Controlez le tour par code : next(), prev(), trigger(), reRun().</p>
        <div class="demo-row">
          <div class="demo-card api-card" id="demo-api-display">
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
        <button class="btn btn-primary" id="btn-api" (click)="startApiTour()">Lancer le tour API</button>
      </div>
    </section>

    <!-- Section: Auto-avance -->
    <section class="section section-gray" id="section-auto">
      <div class="container">
        <h2>Auto-avance (countdown)</h2>
        <p class="section-desc">Les etapes avancent automatiquement avec un compteur a rebours visible.</p>
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
        <button class="btn btn-primary" id="btn-auto" (click)="startAutoTour()">Lancer le tour Auto</button>
      </div>
    </section>

    <!-- Log -->
    <section class="section section-dark">
      <div class="container">
        <h3>Journal des evenements</h3>
        <div class="log-output" id="log-output">
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

    .demo-row {
      display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; align-items: center;
    }

    .demo-card {
      background: white; border-radius: 12px; padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06); flex: 1 1 180px; min-width: 160px;
    }
    .section-gray .demo-card { background: white; }
    .demo-card p { font-size: 13px; color: #888; }

    .avatar {
      width: 52px; height: 52px; border-radius: 50%; background: #6c63ff; color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 18px; margin-bottom: 8px;
    }

    .badge {
      background: #ff6b6b; color: white; padding: 4px 12px; border-radius: 12px;
      font-size: 13px; font-weight: 600; display: inline-block; margin-bottom: 8px;
    }

    .demo-input {
      width: 100%; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 8px;
      font-size: 14px; outline: none; transition: border-color 0.2s;
    }
    .demo-input:focus { border-color: #1ecd97; }

    .demo-zone {
      padding: 16px 24px; border: 2px dashed #ccc; border-radius: 10px;
      color: #999; font-size: 13px; text-align: center; min-width: 140px;
    }

    .api-card { flex: 1 1 200px; }
    .api-card p { margin: 4px 0; font-size: 13px; }

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
export class FeaturesComponent implements OnDestroy {
  hint = inject(WanejoyhintService);
  logs: { time: string; message: string; type: 'info' | 'success' | 'warn' }[] = [];
  private subs: Subscription[] = [];
  private demoTimeouts: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    this.subs.push(
      this.hint.onStepChange.subscribe(({ index, step }) => this.log(`Step ${index + 1}: ${step.selector}`, 'info')),
      this.hint.onEnd.subscribe(() => this.log('Tour termine', 'success')),
      this.hint.onSkip.subscribe(() => this.log('Tour passe', 'warn')),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.clearDemoTimeouts();
    this.hint.stop();
  }

  private clearDemoTimeouts(): void {
    this.demoTimeouts.forEach(t => clearTimeout(t));
    this.demoTimeouts = [];
  }

  private log(message: string, type: 'info' | 'success' | 'warn'): void {
    const time = new Date().toLocaleTimeString('fr-FR', { hour12: false });
    this.logs.unshift({ time, message, type });
  }

  // ---- SHAPES ----
  startShapesTour(): void {
    this.log('--- Tour Formes ---', 'info');
    this.hint.setSteps([
      { selector: '#demo-avatar', description: 'Decoupe <b>circulaire</b> autour de l\'avatar.', shape: 'circle', eventType: 'next' },
      { selector: '#demo-badge', description: 'Badge en <b>cercle</b> avec rayon personnalise.', shape: 'circle', radius: 30, eventType: 'next', showPrev: true },
      { selector: '#demo-card-rect', description: 'Carte en <b>rectangle</b> (forme par defaut).', shape: 'rect', eventType: 'next', showPrev: true },
      { selector: '#demo-input', description: 'Champ avec <b>margin: 20px</b> autour.', shape: 'rect', margin: 20, eventType: 'next', showPrev: true },
    ]);
    this.hint.run({ onEnd: () => this.log('Tour Formes termine', 'success') });
  }

  // ---- EVENTS ----
  startEventsTour(): void {
    this.log('--- Tour Evenements ---', 'info');
    this.hint.setSteps([
      { selector: '#section-events', description: 'Ce tour montre les differents <b>eventType</b> disponibles.', eventType: 'next' },
      { selector: '#demo-click-btn', description: '<b>Cliquez</b> sur ce bouton pour avancer.', eventType: 'click', showNext: false },
      { selector: '#demo-key-input', description: 'Appuyez sur <b>Entree</b> dans ce champ.', eventType: 'key', key: 'Enter', showNext: false },
      { selector: '#demo-auto-btn', description: 'Derniere etape — bouton <b>Suivant</b> classique.', eventType: 'next', showPrev: true },
    ]);
    this.hint.run({ onEnd: () => this.log('Tour Evenements termine', 'success') });
  }

  // ---- BUTTONS ----
  startButtonsTour(): void {
    this.log('--- Tour Boutons ---', 'info');
    this.hint.setSteps([
      {
        selector: '#demo-custom-btns', description: 'Boutons <b>personnalises</b> : texte et classes.', eventType: 'next',
        nextButton: { text: 'Continuer >>' }, skipButton: { text: 'Quitter' },
      },
      {
        selector: '#demo-colors', description: 'Fleche <b style="color:#ff6b6b">rouge</b>.', eventType: 'next',
        arrowColor: '#ff6b6b', showPrev: true,
      },
      {
        selector: '#demo-hidden-btns', description: 'Bouton Skip <b>cache</b> sur cette etape.', eventType: 'next',
        showSkip: false, showPrev: true, arrowColor: '#6c63ff',
      },
    ]);
    this.hint.run({ onEnd: () => this.log('Tour Boutons termine', 'success') });
  }

  // ---- SCROLL ----
  startScrollTour(): void {
    this.log('--- Tour Scroll ---', 'info');
    this.hint.setSteps([
      { selector: '#demo-scroll-start', description: 'On commence ici, en haut.', eventType: 'next' },
      { selector: '#demo-scroll-target', description: 'La bibliotheque a <b>scrolle automatiquement</b> vers cet element !', eventType: 'next', showPrev: true, scrollAnimationSpeed: 300 },
      { selector: '#section-scroll', description: 'Et on remonte. Scroll bidirectionnel OK.', eventType: 'next', showPrev: true },
    ]);
    this.hint.run({ onEnd: () => this.log('Tour Scroll termine', 'success') });
  }

  // ---- API ----
  startApiTour(): void {
    this.clearDemoTimeouts();
    this.log('--- Tour API ---', 'info');
    this.hint.setSteps([
      { selector: '#demo-api-display', description: 'Etape <b>custom</b> — avance automatiquement dans 3s via <code>next()</code>.', eventType: 'custom', showNext: false },
      { selector: '#demo-api-controls', description: 'Encore une etape <b>custom</b> — 3s...', eventType: 'custom', showNext: false },
      { selector: '#section-api', description: 'Derniere etape — <b>Suivant</b> pour terminer.', eventType: 'next' },
    ]);
    this.hint.run({
      onStart: () => {
        this.log('API: run() appele', 'success');
        const t1 = setTimeout(() => {
          if (this.hint.isRunning && this.hint.getCurrentStep() === 0) {
            this.log('API: next() programmatique', 'warn');
            this.hint.next();
            const t2 = setTimeout(() => {
              if (this.hint.isRunning && this.hint.getCurrentStep() === 1) {
                this.log('API: next() a nouveau', 'warn');
                this.hint.next();
              }
            }, 3000);
            this.demoTimeouts.push(t2);
          }
        }, 3000);
        this.demoTimeouts.push(t1);
      },
      onEnd: () => this.log('Tour API termine', 'success'),
    });
  }

  // ---- AUTO ----
  startAutoTour(): void {
    this.log('--- Tour Auto-avance ---', 'info');
    this.hint.setSteps([
      { selector: '#demo-auto-1', description: 'Auto-avance dans <b>5 secondes</b>. Ou cliquez Suivant.', eventType: 'next', autoAdvance: 5000 },
      { selector: '#demo-auto-2', description: 'Auto-avance dans <b>3 secondes</b>.', eventType: 'next', autoAdvance: 3000, showPrev: true },
      { selector: '#demo-auto-3', description: 'Pas d\'auto-avance. Cliquez Suivant pour terminer.', eventType: 'next', showPrev: true },
    ]);
    this.hint.run({ onEnd: () => this.log('Tour Auto termine', 'success') });
  }
}
