import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  WanejoyhintService,
  WanejoyhintStep,
} from '../../../projects/wanejoyhint/src/public-api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
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
        </div>
      </section>

      <!-- Log Output -->
      <section class="log-section" id="log-section">
        <h3>Journal des evenements</h3>
        <div class="log-output" id="log-output">
          <div *ngFor="let log of logs" class="log-entry" [class.log-info]="log.type === 'info'" [class.log-success]="log.type === 'success'" [class.log-warn]="log.type === 'warn'">
            {{ log.time }} - {{ log.message }}
          </div>
          <div *ngIf="logs.length === 0" class="log-placeholder">
            Lancez un tour pour voir les evenements ici...
          </div>
        </div>
        <button class="btn btn-small" (click)="logs = []">Vider le journal</button>
      </section>

      <!-- Target Elements for Tours -->
      <section class="demo-elements">
        <div class="row">
          <div class="card" id="card-search">
            <h3>Recherche</h3>
            <input type="text" id="search-input" placeholder="Tapez ici..." class="demo-input" (keydown)="onSearchKey($event)">
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
                <tr *ngFor="let item of tableData">
                  <td>{{ item.id }}</td>
                  <td>{{ item.name }}</td>
                  <td><span class="status" [class]="'status-' + item.status">{{ item.status }}</span></td>
                  <td><button class="btn btn-small">Voir</button></td>
                </tr>
              </tbody>
            </table>
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
    }

    .demo-header {
      background: linear-gradient(135deg, #1ecd97, #18a87a);
      color: white;
      padding: 30px 40px;
      text-align: center;
    }
    .demo-header h1 { font-size: 2em; margin-bottom: 8px; }
    .demo-header p { opacity: 0.9; font-size: 1.1em; }

    .control-panel {
      padding: 30px 40px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
    }
    .control-panel h2 { margin-bottom: 15px; }

    .btn-group { display: flex; flex-wrap: wrap; gap: 10px; }

    .btn {
      padding: 10px 20px;
      border: 2px solid #1ecd97;
      border-radius: 25px;
      background: transparent;
      color: #1ecd97;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
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
    .btn-small { padding: 5px 15px; font-size: 12px; }

    .log-section {
      padding: 20px 40px;
      background: #fff;
      margin: 20px 40px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .log-section h3 { margin-bottom: 10px; }
    .log-output {
      background: #1e1e2e;
      color: #cdd6f4;
      padding: 15px;
      border-radius: 8px;
      max-height: 200px;
      overflow-y: auto;
      font-family: 'Fira Code', monospace;
      font-size: 13px;
      margin-bottom: 10px;
    }
    .log-entry { padding: 2px 0; }
    .log-info { color: #89b4fa; }
    .log-success { color: #a6e3a1; }
    .log-warn { color: #fab387; }
    .log-placeholder { color: #585b70; font-style: italic; }

    .demo-elements { padding: 20px 40px; }
    .row { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }

    .card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      flex: 1;
      min-width: 200px;
    }
    .card h3 { margin-bottom: 10px; color: #333; }

    .avatar {
      width: 50px; height: 50px;
      border-radius: 50%;
      background: #6c63ff;
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: bold; font-size: 18px;
      margin-bottom: 10px;
    }

    .badge {
      background: #ff6b6b;
      color: white;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 13px;
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
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      min-width: 180px;
      width: 200px;
    }
    .sidebar h3 { margin-bottom: 15px; }
    .sidebar ul { list-style: none; }
    .menu-item {
      padding: 10px 15px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
      margin-bottom: 5px;
    }
    .menu-item:hover { background: #f0f0f0; }

    .main-content {
      flex: 1;
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .main-content h3 { margin-bottom: 10px; }

    .toolbar {
      display: flex; gap: 8px;
      margin: 15px 0;
    }
    .tool-btn {
      padding: 6px 14px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: #fafafa;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
    }
    .tool-btn:hover { background: #e8e8e8; }

    .demo-table {
      width: 100%;
      border-collapse: collapse;
    }
    .demo-table th, .demo-table td {
      padding: 10px 15px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    .demo-table th { font-weight: 600; color: #666; }

    .status {
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-actif { background: #e8f5e9; color: #2e7d32; }
    .status-inactif { background: #fce4ec; color: #c62828; }
    .status-attente { background: #fff3e0; color: #ef6c00; }

    .scroll-target-section { padding: 0 40px; }

    .demo-footer {
      text-align: center;
      padding: 20px;
      color: #999;
      margin-top: 40px;
    }
  `],
})
export class AppComponent implements OnDestroy {
  logs: { time: string; message: string; type: 'info' | 'success' | 'warn' }[] = [];
  private subs: Subscription[] = [];

  tableData = [
    { id: 1, name: 'Projet Alpha', status: 'actif' },
    { id: 2, name: 'Projet Beta', status: 'attente' },
    { id: 3, name: 'Projet Gamma', status: 'inactif' },
    { id: 4, name: 'Projet Delta', status: 'actif' },
  ];

  constructor(private hint: WanejoyhintService) {
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
    this.hint.stop();
  }

  onSearchKey(event: KeyboardEvent): void {
    // Used by the key event tour
  }

  // =============================================
  // 1. TOUR BASIQUE - Next / Prev / Skip
  // =============================================
  startBasicTour(): void {
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
    setTimeout(() => {
      if (this.hint.isRunning && this.hint.getCurrentStep() === 0) {
        this.log('API: hint.next() appele programmatiquement', 'warn');
        this.hint.next();

        // Auto-advance step 2 after 3s more
        setTimeout(() => {
          if (this.hint.isRunning && this.hint.getCurrentStep() === 1) {
            this.log('API: hint.next() appele a nouveau', 'warn');
            this.log('API: getCurrentStep() = ' + this.hint.getCurrentStep(), 'info');
            this.hint.next();
          }
        }, 3000);
      }
    }, 3000);
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
