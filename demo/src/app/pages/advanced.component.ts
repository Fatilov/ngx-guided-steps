import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-advanced',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Header -->
    <div class="hero-bar">
      <div class="container">
        <h1>Documentation</h1>
        <p>Reference complete de toutes les fonctionnalites</p>
      </div>
    </div>

    <div class="layout">
      <!-- Sidebar nav -->
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <a class="nav-link" href="#installation">Installation</a>
          <a class="nav-link" href="#config">Configuration globale</a>
          <a class="nav-link" href="#shapes">Formes (shapes)</a>
          <a class="nav-link" href="#events">Types d'evenements</a>
          <a class="nav-link" href="#buttons">Boutons personnalises</a>
          <a class="nav-link" href="#themes">Themes</a>
          <a class="nav-link" href="#i18n">i18n (labels)</a>
          <a class="nav-link" href="#crossroute">Navigation cross-routes</a>
          <a class="nav-link" href="#modal">Modal et waitForSelector</a>
          <a class="nav-link" href="#scroll">Scroll automatique</a>
          <a class="nav-link" href="#api">API programmatique</a>
          <a class="nav-link" href="#observables">Observables RxJS</a>
          <a class="nav-link" href="#a11y">Accessibilite (WCAG)</a>
          <a class="nav-link" href="#css">CSS Custom Properties</a>
          <a class="nav-link" href="#keyboard">Navigation clavier</a>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="content">

        <!-- 1. Installation -->
        <section class="card" id="installation">
          <div class="card-number">1</div>
          <h2>Installation</h2>
          <p>Installez la librairie via npm :</p>
          <pre class="code-block"><code>npm install ngx-guided-steps</code></pre>
        </section>

        <!-- 2. Configuration globale -->
        <section class="card" id="config">
          <div class="card-number">2</div>
          <h2>Configuration globale</h2>
          <p>Configurez ngx-guided-steps au niveau de l'application dans votre fichier <code>app.config.ts</code>. Fournissez le router pour activer la navigation cross-routes.</p>
          <pre class="code-block"><code [innerHTML]="codeConfig"></code></pre>
        </section>

        <!-- 3. Formes -->
        <section class="card" id="shapes">
          <div class="card-number">3</div>
          <h2>Formes (shapes)</h2>
          <p>Chaque etape peut utiliser une decoupe <code>circle</code> ou <code>rect</code>. La marge optionnelle agrandit la zone de decoupe autour de l'element.</p>
          <pre class="code-block"><code>// Cercle
{{ '{' }} selector: '#avatar', shape: 'circle', description: '...' {{ '}' }}
// Rectangle avec marge
{{ '{' }} selector: '#card', shape: 'rect', margin: 20, description: '...' {{ '}' }}</code></pre>
        </section>

        <!-- 4. Types d'evenements -->
        <section class="card" id="events">
          <div class="card-number">4</div>
          <h2>Types d'evenements</h2>
          <p>Controlez comment l'utilisateur avance d'une etape a la suivante : click sur l'element, touche clavier, evenement custom, ou auto-avance avec countdown.</p>
          <pre class="code-block"><code>// Click sur l'element
{{ '{' }} selector: '#btn', eventType: 'click', showNext: false {{ '}' }}
// Touche clavier
{{ '{' }} selector: '#input', eventType: 'key', key: 'Enter', showNext: false {{ '}' }}
// Evenement custom (avance via hint.next())
{{ '{' }} selector: '#zone', eventType: 'custom', showNext: false {{ '}' }}
// Auto-avance avec countdown
{{ '{' }} selector: '#el', autoAdvance: 5000, description: 'Avance dans 5s' {{ '}' }}</code></pre>
        </section>

        <!-- 5. Boutons personnalises -->
        <section class="card" id="buttons">
          <div class="card-number">5</div>
          <h2>Boutons personnalises</h2>
          <p>Personnalisez le texte des boutons, masquez le bouton skip, affichez le bouton precedent, et changez la couleur de la fleche.</p>
          <pre class="code-block"><code>{{ '{' }}
  selector: '#el',
  nextButton: {{ '{' }} text: 'Continuer &gt;&gt;' {{ '}' }},
  showSkip: false,
  showPrev: true,
  arrowColor: '#ff6b6b',
{{ '}' }}</code></pre>
        </section>

        <!-- 6. Themes -->
        <section class="card" id="themes">
          <div class="card-number">6</div>
          <h2>Themes (dark / light)</h2>
          <p>Deux themes integres. Le theme <code>light</code> (defaut) affiche un overlay sombre avec du texte clair. Le theme <code>dark</code> inverse avec un overlay clair et du texte sombre.</p>
          <pre class="code-block"><code>// Theme light (defaut) - overlay sombre, texte clair
hint.setConfig({{ '{' }} theme: 'light', backgroundColor: 'rgba(0,0,0,0.65)' {{ '}' }});

// Theme dark - overlay clair, texte sombre
hint.setConfig({{ '{' }} theme: 'dark', backgroundColor: 'rgba(255,255,255,0.85)' {{ '}' }});</code></pre>
        </section>

        <!-- 7. i18n -->
        <section class="card" id="i18n">
          <div class="card-number">7</div>
          <h2>i18n (labels)</h2>
          <p>Tous les textes de l'interface sont personnalisables via <code>setConfig()</code>. Utilisez les variables de template pour les indicateurs de progression.</p>
          <pre class="code-block"><code [innerHTML]="codeI18n"></code></pre>
        </section>

        <!-- 8. Navigation cross-routes -->
        <section class="card" id="crossroute">
          <div class="card-number">8</div>
          <h2>Navigation cross-routes</h2>
          <p>Le tour peut naviguer entre les pages de votre application. Utilisez la propriete <code>route</code> et <code>waitForSelector</code> pour cibler des elements sur d'autres pages. Le token <code>GUIDED_STEPS_ROUTER</code> doit etre fourni dans la configuration.</p>
          <pre class="code-block"><code>// Etape sur une autre page
{{ '{' }}
  selector: '#dashboard-stats',
  route: '/dashboard',
  waitForSelector: 5000,
  description: 'Element sur le dashboard.',
{{ '}' }}</code></pre>
        </section>

        <!-- 9. Modal et waitForSelector -->
        <section class="card" id="modal">
          <div class="card-number">9</div>
          <h2>Modal et waitForSelector</h2>
          <p>Utilisez <code>onBeforeStart</code> pour ouvrir un modal ou declencher une action avant l'etape. Combinez avec <code>waitForSelector</code> pour attendre que l'element apparaisse dans le DOM.</p>
          <pre class="code-block"><code>{{ '{' }}
  selector: '#modal-content',
  waitForSelector: 3000,
  onBeforeStart: () =&gt; {{ '{' }}
    this.modalOpen = true;
    this.cdr.detectChanges();
  {{ '}' }},
{{ '}' }}</code></pre>
        </section>

        <!-- 10. Scroll automatique -->
        <section class="card" id="scroll">
          <div class="card-number">10</div>
          <h2>Scroll automatique</h2>
          <p>Si l'element cible est hors du viewport, ngx-guided-steps scrolle automatiquement vers lui. Configurez la vitesse de l'animation de scroll.</p>
          <pre class="code-block"><code>{{ '{' }} selector: '#hidden-el', scrollAnimationSpeed: 300, description: '...' {{ '}' }}</code></pre>
        </section>

        <!-- 11. API programmatique -->
        <section class="card" id="api">
          <div class="card-number">11</div>
          <h2>API programmatique</h2>
          <p>Controlez entierement le tour par code via le service <code>GuidedStepsService</code>. Injectez-le et utilisez les methodes suivantes :</p>
          <pre class="code-block"><code>const hint = inject(GuidedStepsService);

hint.setSteps(steps);
hint.run({{ '{' }} onEnd: () =&gt; console.log('Done') {{ '}' }});
hint.next();
hint.prev();
hint.stop();
hint.reRun(2);
hint.trigger('customEvent');
hint.isRunning;           // boolean
hint.getCurrentStep();    // number
hint.setConfig({{ '{' }} ... {{ '}' }}); // runtime config override</code></pre>
        </section>

        <!-- 12. Observables RxJS -->
        <section class="card" id="observables">
          <div class="card-number">12</div>
          <h2>Observables RxJS</h2>
          <p>Abonnez-vous aux evenements du tour pour reagir aux changements d'etape, a la fin du tour, ou au skip.</p>
          <pre class="code-block"><code [innerHTML]="codeObservables"></code></pre>
        </section>

        <!-- 13. Accessibilite -->
        <section class="card" id="a11y">
          <div class="card-number">13</div>
          <h2>Accessibilite (WCAG)</h2>
          <p>ngx-guided-steps est conforme aux bonnes pratiques d'accessibilite web :</p>
          <dl class="a11y-list">
            <dt>role="dialog" + aria-modal="true"</dt>
            <dd>L'overlay est annonce comme un dialogue modal aux technologies d'assistance.</dd>
            <dt>aria-live="polite"</dt>
            <dd>Les annonces de changement d'etape sont lues automatiquement par les lecteurs d'ecran.</dd>
            <dt>Focus trap (Tab / Shift+Tab)</dt>
            <dd>Le focus reste confine dans l'overlay pendant le tour.</dd>
            <dt>Escape pour fermer</dt>
            <dd>La touche Escape permet de quitter le tour a tout moment.</dd>
            <dt>:focus-visible sur tous les boutons</dt>
            <dd>Les indicateurs de focus sont visibles pour la navigation au clavier.</dd>
          </dl>
        </section>

        <!-- 14. CSS Custom Properties -->
        <section class="card" id="css">
          <div class="card-number">14</div>
          <h2>CSS Custom Properties</h2>
          <p>Personnalisez l'apparence de l'overlay avec les proprietes CSS custom suivantes :</p>
          <pre class="code-block"><code>ngs-overlay {{ '{' }}
  --ngs-btn-color: #6c63ff;
  --ngs-btn-hover-color: white;
  --ngs-label-color: #f0f0f0;
  --ngs-label-font-size: 18px;
  --ngs-close-btn-color: #6c63ff;
{{ '}' }}</code></pre>
        </section>

        <!-- 15. Navigation clavier -->
        <section class="card" id="keyboard">
          <div class="card-number">15</div>
          <h2>Navigation clavier</h2>
          <p>Activez la navigation clavier pour permettre aux utilisateurs de controler le tour sans la souris.</p>
          <div class="table-scroll">
            <table class="key-table">
              <thead>
                <tr>
                  <th>Touche</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><kbd>Arrow Right</kbd></td>
                  <td>Etape suivante</td>
                </tr>
                <tr>
                  <td><kbd>Arrow Left</kbd></td>
                  <td>Etape precedente</td>
                </tr>
                <tr>
                  <td><kbd>Escape</kbd></td>
                  <td>Fermer le tour</td>
                </tr>
                <tr>
                  <td><kbd>Tab</kbd></td>
                  <td>Focus trap (navigation entre boutons)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <pre class="code-block"><code>provideGuidedSteps({{ '{' }} keyboardNav: true {{ '}' }}) // defaut</code></pre>
        </section>

      </main>
    </div>
  `,
  styles: [`
    :host { display: block; overflow-x: hidden; }
    *, *::before, *::after { box-sizing: border-box; }

    /* Hero header */
    .hero-bar {
      background: linear-gradient(135deg, var(--site-hero-from) 0%, var(--site-hero-to) 100%);
      padding: 48px 0 40px;
    }
    .hero-bar h1 {
      font-size: 2em;
      color: var(--site-surface);
      margin: 0 0 8px;
      font-weight: 800;
    }
    .hero-bar p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 16px;
      margin: 0;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* Layout */
    .layout {
      display: flex;
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px;
      gap: 32px;
    }

    /* Sidebar */
    .sidebar {
      width: 220px;
      flex-shrink: 0;
      padding-top: 32px;
      position: sticky;
      top: 0;
      height: fit-content;
      max-height: 100vh;
      overflow-y: auto;
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .nav-link {
      display: block;
      padding: 8px 14px;
      font-size: 13px;
      color: var(--site-text-secondary);
      text-decoration: none;
      border-radius: 6px;
      transition: all 0.15s;
      line-height: 1.4;
    }
    .nav-link:hover {
      background: var(--site-code-inline-bg);
      color: var(--site-text);
    }

    /* Main content */
    .content {
      flex: 1;
      min-width: 0;
      padding: 32px 0 80px;
    }

    /* Cards */
    .card {
      background: var(--site-surface);
      border: 1px solid var(--site-surface-border);
      border-radius: 14px;
      padding: 28px 32px;
      margin-bottom: 24px;
      position: relative;
      box-shadow: 0 2px 8px var(--site-shadow);
      scroll-margin-top: 20px;
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }
    .card:nth-child(even) {
      border-left: 3px solid var(--site-accent);
    }
    .card:nth-child(odd) {
      border-left: 3px solid var(--site-accent-secondary);
    }

    .card-number {
      position: absolute;
      top: -12px;
      left: 24px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--site-text);
      color: var(--site-surface);
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card h2 {
      font-size: 1.25em;
      color: var(--site-text);
      margin: 0 0 10px;
      font-weight: 700;
    }
    .card p {
      color: var(--site-text-secondary);
      font-size: 14px;
      line-height: 1.7;
      margin: 0 0 16px;
    }

    /* Inline code */
    code {
      background: var(--site-code-inline-bg);
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 13px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }

    /* Code blocks */
    .code-block {
      background: var(--site-code-bg);
      color: var(--site-code-text);
      padding: 18px 20px;
      border-radius: 10px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 13px;
      overflow-x: auto;
      max-width: 100%;
      line-height: 1.65;
      margin: 0;
      white-space: pre;
    }
    .code-block code {
      background: none;
      padding: 0;
      color: inherit;
      font-size: inherit;
      white-space: pre;
    }

    /* Accessibility list */
    .a11y-list {
      margin: 0;
      padding: 0;
    }
    .a11y-list dt {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 13px;
      color: var(--site-text);
      font-weight: 600;
      margin-top: 14px;
      padding: 4px 8px;
      background: var(--site-code-inline-bg);
      border-radius: 4px;
      display: inline-block;
    }
    .a11y-list dt:first-child {
      margin-top: 0;
    }
    .a11y-list dd {
      margin: 6px 0 0 0;
      color: var(--site-text-secondary);
      font-size: 14px;
      line-height: 1.6;
    }

    /* Table scroll wrapper */
    .table-scroll {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      margin-bottom: 20px;
    }

    /* Keyboard table */
    .key-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0;
      font-size: 14px;
    }
    .key-table th {
      text-align: left;
      padding: 10px 14px;
      background: var(--site-bg);
      color: var(--site-text);
      font-weight: 600;
      font-size: 13px;
      border-bottom: 2px solid var(--site-surface-border);
    }
    .key-table td {
      padding: 10px 14px;
      border-bottom: 1px solid var(--site-surface-border);
      color: var(--site-text-secondary);
    }
    kbd {
      background: var(--site-code-inline-bg);
      border: 1px solid var(--site-surface-border);
      border-radius: 5px;
      padding: 3px 8px;
      font-size: 12px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      box-shadow: 0 1px 2px var(--site-shadow);
    }

    /* Tablet */
    @media (max-width: 768px) {
      .hero-bar { padding: 32px 0 28px; }
      .hero-bar h1 { font-size: 1.5em; }
      .container { padding: 0 16px; }
      .layout { flex-direction: column; gap: 0; padding: 0 16px; }
      .sidebar {
        width: 100%;
        position: static;
        padding: 20px 0 0;
        max-height: none;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .sidebar-nav {
        flex-direction: row;
        flex-wrap: nowrap;
        gap: 4px;
        padding-bottom: 12px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .nav-link {
        white-space: nowrap;
        padding: 6px 12px;
        font-size: 12px;
        background: var(--site-bg);
        border-radius: 20px;
      }
      .content { padding: 20px 0 60px; }
      .card { padding: 22px 20px; max-width: 100%; }
      .card h2 { font-size: 1.1em; }
      .code-block { font-size: 12px; padding: 14px 16px; }
      .a11y-list dt { display: block; }
    }

    /* Small phones */
    @media (max-width: 480px) {
      .hero-bar { padding: 24px 0 20px; }
      .hero-bar h1 { font-size: 1.25em; }
      .hero-bar p { font-size: 14px; }
      .container { padding: 0 12px; }
      .layout { padding: 0 12px; }
      .card { padding: 18px 14px; border-radius: 10px; }
      .card h2 { font-size: 1em; }
      .card p { font-size: 13px; }
      .card-number { width: 24px; height: 24px; font-size: 11px; top: -10px; left: 14px; }
      .code-block { font-size: 11px; padding: 12px 10px; border-radius: 8px; }
      .nav-link { font-size: 11px; padding: 5px 10px; }
      .key-table { font-size: 13px; }
      .key-table th, .key-table td { padding: 8px 10px; }
      kbd { font-size: 11px; padding: 2px 6px; }
      .a11y-list dt { font-size: 12px; }
      .a11y-list dd { font-size: 13px; }
    }
  `],
})
export class AdvancedComponent {

  // Code snippets that contain {{ }} must use [innerHTML] binding.

  codeConfig =
`<span style="color:#8b949e">// app.config.ts</span>
<span style="color:#ff7b72">import</span> { provideGuidedSteps, GUIDED_STEPS_ROUTER } <span style="color:#ff7b72">from</span> <span style="color:#a5d6ff">'ngx-guided-steps'</span>;

provideGuidedSteps({
  backgroundColor: <span style="color:#a5d6ff">'rgba(0,0,0,0.7)'</span>,
  showProgress: <span style="color:#79c0ff">true</span>,
  theme: <span style="color:#a5d6ff">'light'</span>,
  keyboardNav: <span style="color:#79c0ff">true</span>,
  backdropDismiss: <span style="color:#79c0ff">false</span>,
  labels: {
    next: <span style="color:#a5d6ff">'Suivant'</span>,
    prev: <span style="color:#a5d6ff">'Precedent'</span>,
    skip: <span style="color:#a5d6ff">'Passer'</span>,
    close: <span style="color:#a5d6ff">'Fermer'</span>,
    progress: <span style="color:#a5d6ff">'{{current}} sur {{total}}'</span>,
  },
}),
{ provide: GUIDED_STEPS_ROUTER, useExisting: Router },`;

  codeI18n =
`hint.setConfig({
  labels: {
    next: <span style="color:#a5d6ff">'Next'</span>,
    prev: <span style="color:#a5d6ff">'Previous'</span>,
    skip: <span style="color:#a5d6ff">'Skip'</span>,
    progress: <span style="color:#a5d6ff">'{{current}} of {{total}}'</span>,
    stepLabel: <span style="color:#a5d6ff">'Step {{current}} of {{total}}'</span>,
  },
});`;

  codeObservables =
`hint.onStepChange.subscribe(({ index, step }) =&gt; {
  console.log(<span style="color:#a5d6ff">'Step'</span>, index + 1, step.selector);
});
hint.onEnd.subscribe(() =&gt; console.log(<span style="color:#a5d6ff">'Done'</span>));
hint.onSkip.subscribe(() =&gt; console.log(<span style="color:#a5d6ff">'Skipped'</span>));`;
}
