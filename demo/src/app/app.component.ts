import { Component, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  WanejoyhintService,
  WanejoyhintStep,
  WANEJOYHINT_CONFIG,
} from '../../../projects/wanejoyhint/src/public-api';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div class="demo-container">
      <header class="demo-header" id="demo-header">
        <h1>Wanejoyhint - Demo Complete</h1>
        <p>Test de toutes les fonctionnalites de la bibliotheque</p>
      </header>

      <!-- Control Panel -->
      <section class="control-panel" id="control-panel">
        <h2>Panneau de controle</h2>
        <div class="btn-group">
          <button class="btn btn-primary" id="btn-basic-tour" (click)="startBasicTour()">
            1. Tour basique (Next/Prev/Skip)
          </button>
          <button class="btn btn-secondary" id="btn-shapes-tour" (click)="startShapesTour()">
            2. Formes (Rect + Circle)
          </button>
          <button class="btn btn-accent" id="btn-events-tour" (click)="startEventsTour()">
            3. Evenements (click, key, custom)
          </button>
          <button class="btn btn-warning" id="btn-advanced-tour" (click)="startAdvancedTour()">
            4. Avance (boutons custom, couleurs, callbacks)
          </button>
          <button class="btn btn-info" id="btn-scroll-tour" (click)="startScrollTour()">
            5. Scroll + Elements hors viewport
          </button>
          <button class="btn btn-dark" id="btn-programmatic" (click)="startProgrammaticTour()">
            6. API programmatique (trigger, reRun, setCurrentStep)
          </button>
          <button class="btn btn-primary" id="btn-i18n-tour" (click)="startI18nTour()">
            7. i18n (labels en francais)
          </button>
          <button class="btn btn-secondary" id="btn-theme-tour" (click)="startThemeTour()">
            8. Theme sombre
          </button>
          <button class="btn btn-accent" id="btn-auto-tour" (click)="startAutoAdvanceTour()">
            9. Auto-avance + clavier + backdrop
          </button>
        </div>
      </section>

      <!-- Log Output -->
      <section class="log-section" id="log-section">
        <h3>Journal des evenements</h3>
        <div class="log-output" id="log-output">
          @for (log of logs; track $index) {
          <div class="log-entry" [class.log-info]="log.type === 'info'" [class.log-success]="log.type === 'success'" [class.log-warn]="log.type === 'warn'">
            {{ log.time }} - {{ log.message }}
          </div>
          } @empty {
          <div class="log-placeholder">
            Lancez un tour pour voir les evenements ici...
          </div>
          }
        </div>
        <button class="btn btn-small" (click)="logs = []">Vider le journal</button>
      </section>

      <!-- Target Elements for Tours -->
      <section class="demo-elements">
        <div class="row">
          <div class="card" id="card-search">
            <h3>Recherche</h3>
            <input type="text" id="search-input" placeholder="Tapez ici..." class="demo-input">
            <button class="btn btn-small" id="search-btn">Rechercher</button>
          </div>

          <div class="card" id="card-profile">
            <h3>Profil</h3>
            <div class="avatar" id="avatar">JD</div>
            <p>Jean Dupont</p>
            <button class="btn btn-small" id="edit-profile-btn">Modifier</button>
          </div>

          <div class="card" id="card-notifications">
            <h3>Notifications</h3>
            <span class="badge" id="notif-badge">3</span>
            <ul>
              <li>Nouveau message</li>
              <li>Mise a jour</li>
              <li>Rappel</li>
            </ul>
          </div>
        </div>

        <div class="row">
          <nav class="sidebar" id="sidebar">
            <h3>Menu</h3>
            <ul>
              <li id="menu-home" class="menu-item">Accueil</li>
              <li id="menu-dashboard" class="menu-item">Tableau de bord</li>
              <li id="menu-settings" class="menu-item">Parametres</li>
              <li id="menu-help" class="menu-item">Aide</li>
            </ul>
          </nav>

          <div class="main-content" id="main-content">
            <h3>Contenu principal</h3>
            <p>Ceci est la zone de contenu principal de l'application.</p>
            <div class="toolbar" id="toolbar">
              <button class="tool-btn" id="tool-add">+ Ajouter</button>
              <button class="tool-btn" id="tool-edit">Editer</button>
              <button class="tool-btn" id="tool-delete">Supprimer</button>
              <button class="tool-btn" id="tool-export">Exporter</button>
            </div>
            <div class="table-wrapper">
              <table class="demo-table" id="demo-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of tableData; track item.id) {
                  <tr>
                    <td>{{ item.id }}</td>
                    <td>{{ item.name }}</td>
                    <td><span class="status" [class]="'status-' + item.status">{{ item.status }}</span></td>
                    <td><button class="btn btn-small">Voir</button></td>
                  </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- Far below content for scroll test -->
      <section class="scroll-target-section">
        <div style="height: 800px; display: flex; align-items: center; justify-content: center; color: #999;">
          &darr; Faites defiler pour voir l'element cible ci-dessous &darr;
        </div>
        <div class="card" id="scroll-target" style="max-width: 400px; margin: 0 auto;">
          <h3>Element cache</h3>
          <p>Cet element est loin en bas de la page. Le tour doit y scroller automatiquement.</p>
          <button class="btn btn-primary" id="scroll-target-btn">Action cachee</button>
        </div>
        <div style="height: 400px;"></div>
      </section>

      <footer class="demo-footer" id="demo-footer">
        <p>Wanejoyhint v1.0.0 - Bibliotheque Angular de tutoriels interactifs</p>
      </footer>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .demo-container {
      font-family: 'Segoe UI', sans-serif;
      color: #333;
      background: #f5f7fa;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .demo-header {
      background: linear-gradient(135deg, #1ecd97, #18a87a);
      color: white;
      padding: 24px 20px;
      text-align: center;
    }
    .demo-header h1 { font-size: 1.6em; margin-bottom: 6px; }
    .demo-header p { opacity: 0.9; font-size: 0.95em; }

    .control-panel {
      padding: 20px 16px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
    }
    .control-panel h2 { margin-bottom: 12px; font-size: 1.2em; }

    .btn-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .btn {
      padding: 8px 14px;
      border: 2px solid #1ecd97;
      border-radius: 25px;
      background: transparent;
      color: #1ecd97;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
      text-align: center;
    }
    .btn:hover { background: #1ecd97; color: white; }
    .btn-primary { border-color: #1ecd97; color: #1ecd97; }
    .btn-primary:hover { background: #1ecd97; }
    .btn-secondary { border-color: #6c63ff; color: #6c63ff; }
    .btn-secondary:hover { background: #6c63ff; }
    .btn-accent { border-color: #ff6b6b; color: #ff6b6b; }
    .btn-accent:hover { background: #ff6b6b; }
    .btn-warning { border-color: #ffa726; color: #ffa726; }
    .btn-warning:hover { background: #ffa726; }
    .btn-info { border-color: #29b6f6; color: #29b6f6; }
    .btn-info:hover { background: #29b6f6; }
    .btn-dark { border-color: #455a64; color: #455a64; }
    .btn-dark:hover { background: #455a64; }
    .btn-small { padding: 5px 12px; font-size: 12px; }

    .log-section {
      padding: 16px;
      background: #fff;
      margin: 12px 16px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .log-section h3 { margin-bottom: 8px; font-size: 1em; }
    .log-output {
      background: #1e1e2e;
      color: #cdd6f4;
      padding: 12px;
      border-radius: 8px;
      max-height: 150px;
      overflow-y: auto;
      font-family: 'Fira Code', 'Courier New', monospace;
      font-size: 12px;
      margin-bottom: 8px;
      word-break: break-word;
    }
    .log-entry { padding: 2px 0; }
    .log-info { color: #89b4fa; }
    .log-success { color: #a6e3a1; }
    .log-warn { color: #fab387; }
    .log-placeholder { color: #585b70; font-style: italic; }

    .demo-elements { padding: 12px 16px; }
    .row {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .card {
      background: white;
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      flex: 1 1 100%;
      min-width: 0;
    }
    .card h3 { margin-bottom: 8px; color: #333; font-size: 1em; }

    .avatar {
      width: 44px; height: 44px;
      border-radius: 50%;
      background: #6c63ff;
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: bold; font-size: 16px;
      margin-bottom: 8px;
    }

    .badge {
      background: #ff6b6b;
      color: white;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }

    .demo-input {
      width: 100%;
      padding: 8px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 10px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.3s;
    }
    .demo-input:focus { border-color: #1ecd97; }

    .sidebar {
      background: white;
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      flex: 1 1 100%;
      min-width: 0;
    }
    .sidebar h3 { margin-bottom: 12px; font-size: 1em; }
    .sidebar ul { list-style: none; }
    .menu-item {
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
      margin-bottom: 4px;
    }
    .menu-item:hover { background: #f0f0f0; }

    .main-content {
      flex: 1 1 100%;
      min-width: 0;
      background: white;
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .main-content h3 { margin-bottom: 8px; font-size: 1em; }

    .toolbar {
      display: flex;
      gap: 6px;
      margin: 12px 0;
      flex-wrap: wrap;
    }
    .tool-btn {
      padding: 6px 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: #fafafa;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }
    .tool-btn:hover { background: #e8e8e8; }

    .table-wrapper {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .demo-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 360px;
    }
    .demo-table th, .demo-table td {
      padding: 8px 10px;
      text-align: left;
      border-bottom: 1px solid #eee;
      font-size: 13px;
      white-space: nowrap;
    }
    .demo-table th { font-weight: 600; color: #666; }

    .status {
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }
    .status-actif { background: #e8f5e9; color: #2e7d32; }
    .status-inactif { background: #fce4ec; color: #c62828; }
    .status-attente { background: #fff3e0; color: #ef6c00; }

    .scroll-target-section { padding: 0 16px; }

    .demo-footer {
      text-align: center;
      padding: 16px;
      color: #999;
      margin-top: 30px;
      font-size: 0.85em;
    }

    /* ==================== TABLET ==================== */
    @media (min-width: 640px) {
      .demo-header { padding: 28px 30px; }
      .demo-header h1 { font-size: 1.8em; }

      .control-panel { padding: 24px 30px; }

      .btn { font-size: 14px; padding: 9px 18px; }

      .log-section { margin: 16px 30px; padding: 20px; }

      .demo-elements { padding: 16px 30px; }

      .card { flex: 1 1 calc(50% - 8px); }
      .sidebar { flex: 0 0 200px; }
      .main-content { flex: 1 1 0; }

      .scroll-target-section { padding: 0 30px; }
    }

    /* ==================== DESKTOP ==================== */
    @media (min-width: 960px) {
      .demo-header { padding: 30px 40px; }
      .demo-header h1 { font-size: 2em; }
      .demo-header p { font-size: 1.1em; }

      .control-panel { padding: 30px 40px; }
      .control-panel h2 { font-size: 1.4em; }

      .btn-group { gap: 10px; }

      .log-section { margin: 20px 40px; padding: 20px 40px; }
      .log-output { font-size: 13px; max-height: 200px; }

      .demo-elements { padding: 20px 40px; }
      .row { gap: 20px; margin-bottom: 20px; }

      .card {
        flex: 1 1 0;
        min-width: 200px;
        padding: 20px;
      }

      .demo-table th, .demo-table td {
        padding: 10px 15px;
        font-size: 14px;
      }

      .scroll-target-section { padding: 0 40px; }
    }
  `],
})
export class AppComponent implements OnDestroy {
  logs: { time: string; message: string; type: 'info' | 'success' | 'warn' }[] = [];
  private subs: Subscription[] = [];
  private demoTimeouts: ReturnType<typeof setTimeout>[] = [];

  tableData = [
    { id: 1, name: 'Projet Alpha', status: 'actif' },
    { id: 2, name: 'Projet Beta', status: 'attente' },
    { id: 3, name: 'Projet Gamma', status: 'inactif' },
    { id: 4, name: 'Projet Delta', status: 'actif' },
  ];

  private hint = inject(WanejoyhintService);

  constructor() {
    this.subs.push(
      this.hint.onStepChange.subscribe(({ index, step }) =>
        this.log(`Step ${index + 1}: ${step.selector}`, 'info')
      ),
      this.hint.onEnd.subscribe(() => this.log('Tour termine!', 'success')),
      this.hint.onSkip.subscribe(() => this.log('Tour passe par l\'utilisateur', 'warn'))
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.clearDemoTimeouts();
    this.hint.stop();
  }

  private clearDemoTimeouts(): void {
    for (const t of this.demoTimeouts) {
      clearTimeout(t);
    }
    this.demoTimeouts = [];
  }

  // =============================================
  // 1. TOUR BASIQUE - Next / Prev / Skip
  // =============================================
  startBasicTour(): void {
    this.clearDemoTimeouts();
    this.log('--- Tour Basique demarre ---', 'info');
    const steps: WanejoyhintStep[] = [
      {
        selector: '#demo-header',
        description: '<b>Bienvenue!</b><br>Ceci est le header de l\'application. Cliquez <b>Suivant</b> pour continuer.',
        eventType: 'next',
      },
      {
        selector: '#control-panel',
        description: 'Le panneau de controle vous permet de lancer differents tours de demonstration.',
        eventType: 'next',
      },
      {
        selector: '#log-section',
        description: 'Le journal affiche tous les evenements en temps reel (callbacks, changements d\'etapes, etc.).',
        eventType: 'next',
      },
      {
        selector: '#card-search',
        description: 'Testez la navigation: utilisez <b>Precedent</b> pour revenir en arriere, ou <b>Passer</b> pour quitter.',
        eventType: 'next',
        showPrev: true,
        showSkip: true,
      },
      {
        selector: '#demo-footer',
        description: 'Fin du tour basique! Les boutons Suivant/Precedent/Passer fonctionnent correctement.',
        eventType: 'next',
        showPrev: true,
      },
    ];

    this.hint.setSteps(steps);
    this.hint.run({
      onStart: () => this.log('Callback onStart() appele', 'success'),
      onEnd: () => this.log('Callback onEnd() appele', 'success'),
      onSkip: () => this.log('Callback onSkip() appele', 'warn'),
      onNext: () => this.log('Callback onNext() appele', 'info'),
    });
  }

  // =============================================
  // 2. TOUR FORMES - Rect vs Circle
  // =============================================
  startShapesTour(): void {
    this.clearDemoTimeouts();
    this.log('--- Tour Formes demarre ---', 'info');
    const steps: WanejoyhintStep[] = [
      {
        selector: '#avatar',
        description: 'L\'avatar utilise une decoupe <b>cercle</b>.',
        shape: 'circle',
        eventType: 'next',
      },
      {
        selector: '#notif-badge',
        description: 'Le badge aussi est en forme de <b>cercle</b>, avec un rayon personalise.',
        shape: 'circle',
        radius: 30,
        eventType: 'next',
      },
      {
        selector: '#card-profile',
        description: 'La carte entiere est en forme de <b>rectangle</b> (par defaut).',
        shape: 'rect',
        eventType: 'next',
      },
      {
        selector: '#search-input',
        description: 'Le champ de recherche: rectangle avec <b>margin: 20px</b> autour.',
        shape: 'rect',
        margin: 20,
        eventType: 'next',
      },
      {
        selector: '#toolbar',
        description: 'La barre d\'outils: rectangle avec <b>offsets personnalises</b> (top: -5, left: -10).',
        shape: 'rect',
        top: -5,
        left: -10,
        right: -10,
        bottom: -5,
        eventType: 'next',
      },
    ];

    this.hint.setSteps(steps);
    this.hint.run({
      onStart: () => this.log('Tour formes demarre', 'success'),
      onEnd: () => this.log('Tour formes termine', 'success'),
    });
  }

  // =============================================
  // 3. TOUR EVENEMENTS - click, key, custom
  // =============================================
  startEventsTour(): void {
    this.clearDemoTimeouts();
    this.log('--- Tour Evenements demarre ---', 'info');
    const steps: WanejoyhintStep[] = [
      {
        selector: '#search-btn',
        description: '<b>Cliquez</b> sur le bouton "Rechercher" pour avancer.',
        eventType: 'click',
        showNext: false,
      },
      {
        selector: '#menu-dashboard',
        description: '<b>Cliquez</b> sur "Tableau de bord" dans le menu.',
        eventType: 'click',
        showNext: false,
      },
      {
        selector: '#tool-add',
        description: 'Derniere etape: cliquez <b>Suivant</b> (evenement "next" classique).',
        eventType: 'next',
      },
    ];

    this.hint.setSteps(steps);
    this.hint.run({
      onStart: () => this.log('Tour evenements demarre', 'success'),
      onEnd: () => this.log('Tour evenements termine', 'success'),
    });
  }

  // =============================================
  // 4. TOUR AVANCE - boutons custom, couleurs, callbacks
  // =============================================
  startAdvancedTour(): void {
    this.clearDemoTimeouts();
    this.log('--- Tour Avance demarre ---', 'info');
    const steps: WanejoyhintStep[] = [
      {
        selector: '#card-search',
        description: 'Boutons personnalises: texte et classes CSS modifiees.',
        eventType: 'next',
        nextButton: { text: 'Continuer >>', className: 'custom-next' },
        skipButton: { text: 'Quitter', className: 'custom-skip' },
        prevButton: { text: '<< Retour', className: 'custom-prev' },
        showPrev: false,
      },
      {
        selector: '#sidebar',
        description: 'Fleche <b style="color: #ff6b6b;">rouge</b> vers l\'element.',
        eventType: 'next',
        arrowColor: '#ff6b6b',
        nextButton: { text: 'Encore >>' },
        showPrev: true,
      },
      {
        selector: '#demo-table',
        description: 'Fleche <b style="color: #ffa726;">orange</b> + timeout de <b>500ms</b> avant affichage.',
        eventType: 'next',
        arrowColor: '#ffa726',
        timeout: 500,
        onBeforeStart: () => this.log('onBeforeStart() appele pour step 3', 'info'),
        showPrev: true,
      },
      {
        selector: '#card-notifications',
        description: 'Bouton Skip <b>cache</b> sur cette etape.',
        eventType: 'next',
        showSkip: false,
        showPrev: true,
      },
      {
        selector: '#tool-export',
        description: 'Bouton Prev <b>cache</b> sur cette etape.',
        eventType: 'next',
        showPrev: false,
        showSkip: true,
      },
    ];

    this.hint.setSteps(steps);
    this.hint.run({
      onStart: () => this.log('Tour avance demarre', 'success'),
      onEnd: () => this.log('Tour avance termine - tous les boutons custom testes', 'success'),
      onSkip: () => this.log('Tour avance passe', 'warn'),
      onNext: () => this.log('Transition avancee', 'info'),
    });
  }

  // =============================================
  // 5. TOUR SCROLL - elements hors viewport
  // =============================================
  startScrollTour(): void {
    this.clearDemoTimeouts();
    this.log('--- Tour Scroll demarre ---', 'info');
    const steps: WanejoyhintStep[] = [
      {
        selector: '#demo-header',
        description: 'On commence en haut de la page.',
        eventType: 'next',
      },
      {
        selector: '#scroll-target',
        description: 'La bibliotheque a <b>scrolle automatiquement</b> vers cet element qui etait hors du viewport!',
        eventType: 'next',
        scrollAnimationSpeed: 300,
      },
      {
        selector: '#scroll-target-btn',
        description: 'Ce bouton etait aussi cache. La decoupe s\'est positionnee correctement apres le scroll.',
        eventType: 'next',
        shape: 'rect',
      },
      {
        selector: '#control-panel',
        description: 'Et on remonte en haut! Le scroll fonctionne dans les deux sens.',
        eventType: 'next',
      },
    ];

    this.hint.setSteps(steps);
    this.hint.run({
      onStart: () => this.log('Tour scroll demarre', 'success'),
      onEnd: () => this.log('Tour scroll termine - scroll bidirectionnel OK', 'success'),
    });
  }

  // =============================================
  // 6. TOUR PROGRAMMATIQUE - API avancee
  // =============================================
  startProgrammaticTour(): void {
    this.clearDemoTimeouts();
    this.log('--- Tour Programmatique demarre ---', 'info');
    const steps: WanejoyhintStep[] = [
      {
        selector: '#card-search',
        description: 'Step 1/4 - Dans <b>3 secondes</b>, le service avancera automatiquement via <code>hint.next()</code>.',
        eventType: 'custom',
        showNext: false,
      },
      {
        selector: '#card-profile',
        description: 'Step 2/4 - Avance par <code>next()</code> programmatique. Attendez encore 3s...',
        eventType: 'custom',
        showNext: false,
      },
      {
        selector: '#sidebar',
        description: 'Step 3/4 - <code>setCurrentStep()</code> = ' + 2 + ', <code>getCurrentStep()</code> verifie. Cliquez Suivant.',
        eventType: 'next',
      },
      {
        selector: '#main-content',
        description: 'Step 4/4 - Tour complet via API programmatique! Toutes les methodes fonctionnent.',
        eventType: 'next',
      },
    ];

    this.hint.setSteps(steps);
    this.hint.run({
      onStart: () => {
        this.log('API: run() appele', 'success');
        this.log('API: getCurrentStep() = ' + this.hint.getCurrentStep(), 'info');
        this.log('API: isRunning = ' + this.hint.isRunning, 'info');
      },
      onEnd: () => this.log('API: Tour termine via onEnd callback', 'success'),
    });

    // Auto-advance step 1 after 3s
    const t1 = setTimeout(() => {
      if (this.hint.isRunning && this.hint.getCurrentStep() === 0) {
        this.log('API: hint.next() appele programmatiquement', 'warn');
        this.hint.next();

        // Auto-advance step 2 after 3s more
        const t2 = setTimeout(() => {
          if (this.hint.isRunning && this.hint.getCurrentStep() === 1) {
            this.log('API: hint.next() appele a nouveau', 'warn');
            this.log('API: getCurrentStep() = ' + this.hint.getCurrentStep(), 'info');
            this.hint.next();
          }
        }, 3000);
        this.demoTimeouts.push(t2);
      }
    }, 3000);
    this.demoTimeouts.push(t1);
  }

  // =============================================
  // 7. TOUR i18n - Labels en francais
  // =============================================
  startI18nTour(): void {
    this.clearDemoTimeouts();
    this.log('--- Tour i18n demarre ---', 'info');

    // Create a second service instance with French labels via config override
    // For demo purposes we reconfigure the default labels at runtime
    const overlay = (this.hint as any).overlayRef?.instance;
    const savedLabels = overlay?.labels;

    const steps: WanejoyhintStep[] = [
      {
        selector: '#demo-header',
        description: 'Les boutons sont maintenant en <b>francais</b> grace au systeme i18n!',
        eventType: 'next',
      },
      {
        selector: '#control-panel',
        description: 'Tous les textes UI sont configurables: boutons, progression, annonces screen reader.',
        eventType: 'next',
        showPrev: true,
      },
      {
        selector: '#log-section',
        description: 'La progression affiche aussi le format personnalise: "Etape X sur Y".',
        eventType: 'next',
        showPrev: true,
      },
    ];

    this.hint.setSteps(steps);
    this.hint.run({
      onStart: () => {
        this.log('i18n: Labels FR appliques', 'success');
        // Apply French labels at runtime
        const ref = (this.hint as any).overlayRef?.instance;
        if (ref) {
          ref.labels = {
            next: 'Suivant',
            prev: 'Precedent',
            skip: 'Passer',
            close: 'Fermer le tutoriel',
            progress: 'Etape {{current}} sur {{total}}',
            stepLabel: 'Etape {{current}} sur {{total}}',
            stepAnnouncement: 'Etape {{current}} sur {{total}}: {{description}}',
          };
          ref.config = { ...ref.config, showProgress: true };
        }
      },
      onEnd: () => {
        this.log('i18n: Tour termine', 'success');
        // Restore default labels
        const ref = (this.hint as any).overlayRef?.instance;
        if (ref && savedLabels) ref.labels = savedLabels;
      },
    });
  }

  // =============================================
  // 8. TOUR THEME - Theme sombre
  // =============================================
  startThemeTour(): void {
    this.clearDemoTimeouts();
    this.log('--- Tour Theme Sombre demarre ---', 'info');

    const steps: WanejoyhintStep[] = [
      {
        selector: '#demo-header',
        description: 'Ce tour utilise un overlay <b>clair</b> avec un theme sombre pour les boutons.',
        eventType: 'next',
      },
      {
        selector: '#card-profile',
        description: 'Les boutons et textes s\'adaptent au theme pour rester lisibles.',
        eventType: 'next',
        showPrev: true,
      },
      {
        selector: '#sidebar',
        description: 'Le theme "dark" inverse les couleurs des boutons, du texte et du bouton fermer.',
        eventType: 'next',
        showPrev: true,
      },
    ];

    this.hint.setSteps(steps);
    this.hint.run({
      onStart: () => {
        this.log('Theme: overlay clair + boutons sombres', 'success');
        const ref = (this.hint as any).overlayRef?.instance;
        if (ref) {
          ref.config = {
            ...ref.config,
            backgroundColor: 'rgba(255,255,255,0.85)',
            theme: 'dark',
            showProgress: true,
          };
        }
      },
      onEnd: () => {
        this.log('Theme: Tour termine', 'success');
        const ref = (this.hint as any).overlayRef?.instance;
        if (ref) {
          ref.config = {
            ...ref.config,
            backgroundColor: 'rgba(0,0,0,0.6)',
            theme: 'light',
            showProgress: false,
          };
        }
      },
    });
  }

  // =============================================
  // 9. AUTO-ADVANCE + Keyboard + Backdrop
  // =============================================
  startAutoAdvanceTour(): void {
    this.clearDemoTimeouts();
    this.log('--- Tour Auto-avance demarre ---', 'info');

    const steps: WanejoyhintStep[] = [
      {
        selector: '#demo-header',
        description: 'Cette etape avance <b>automatiquement</b> dans 5 secondes. Ou utilisez les fleches &larr; &rarr; du clavier!',
        eventType: 'next',
        autoAdvance: 5000,
      },
      {
        selector: '#card-search',
        description: 'Auto-avance dans 3 secondes. Vous pouvez aussi cliquer sur l\'overlay sombre pour quitter.',
        eventType: 'next',
        autoAdvance: 3000,
        showPrev: true,
      },
      {
        selector: '#card-profile',
        description: 'Derniere etape. Pas d\'auto-avance ici. Cliquez Suivant ou fleche droite &rarr;',
        eventType: 'next',
        showPrev: true,
      },
    ];

    this.hint.setSteps(steps);
    this.hint.run({
      onStart: () => {
        this.log('Auto: backdropDismiss + keyboardNav actifs', 'success');
        const ref = (this.hint as any).overlayRef?.instance;
        if (ref) {
          ref.config = { ...ref.config, backdropDismiss: true, showProgress: true };
        }
      },
      onEnd: () => this.log('Auto: Tour termine', 'success'),
      onSkip: () => this.log('Auto: Tour ferme (backdrop ou ESC)', 'warn'),
    });
  }

  // =============================================
  // Utilities
  // =============================================
  private log(message: string, type: 'info' | 'success' | 'warn'): void {
    const now = new Date();
    const time = now.toLocaleTimeString('fr-FR', { hour12: false });
    this.logs.unshift({ time, message, type });
  }
}
