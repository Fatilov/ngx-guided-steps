import { Component, inject, OnDestroy } from '@angular/core';
import { WanejoyhintService, WanejoyhintStep } from '../../../../projects/wanejoyhint/src/public-api';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <!-- Hero Section -->
    <section id="hero" class="hero">
      <div class="hero-content">
        <div class="hero-badge">Angular 18+</div>
        <h1 class="hero-title">Tutoriels interactifs<br><span class="hero-title-accent">pour Angular</span></h1>
        <p class="hero-subtitle">
          Guidez vos utilisateurs pas a pas avec des overlays SVG, des fleches animees
          et une accessibilite complete.
        </p>
        <div class="hero-actions">
          <button id="hero-cta" class="btn btn-primary" (click)="startQuickTour()">
            <span class="btn-icon">&#9654;</span>
            Lancer la demo
          </button>
          <a
            class="btn btn-secondary"
            href="https://github.com/wanejoyhint/wanejoyhint"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="btn-icon">&#9671;</span>
            Voir sur GitHub
          </a>
        </div>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <div class="hero-visual-card">
          <div class="visual-bar"></div>
          <div class="visual-bar visual-bar--short"></div>
          <div class="visual-tooltip">
            <div class="visual-tooltip-dot"></div>
            <div class="visual-tooltip-text"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature Grid -->
    <section id="feature-grid" class="features">
      <div class="section-container">
        <h2 class="section-title">Tout ce dont vous avez besoin</h2>
        <p class="section-subtitle">Une bibliotheque pensee pour les developpeurs Angular modernes.</p>
        <div class="feature-grid">
          <!-- SVG Overlay -->
          <div id="feat-svg" class="feature-card">
            <div class="feature-icon feature-icon--svg">
              <div class="icon-shape icon-shape--svg"></div>
            </div>
            <h3 class="feature-title">Overlay SVG</h3>
            <p class="feature-desc">
              Decoupe masque SVG avec formes <code>rect</code> et <code>circle</code> autour des elements cibles.
            </p>
          </div>

          <!-- Mobile First -->
          <div id="feat-responsive" class="feature-card">
            <div class="feature-icon feature-icon--responsive">
              <div class="icon-shape icon-shape--responsive"></div>
            </div>
            <h3 class="feature-title">Mobile First</h3>
            <p class="feature-desc">
              Design responsive avec breakpoints a 640px et 960px. Touch-friendly.
            </p>
          </div>

          <!-- Accessibility -->
          <div id="feat-a11y" class="feature-card">
            <div class="feature-icon feature-icon--a11y">
              <div class="icon-shape icon-shape--a11y"></div>
            </div>
            <h3 class="feature-title">Accessibilite WCAG</h3>
            <p class="feature-desc">
              <code>role=dialog</code>, <code>aria-live</code>, focus trap, navigation clavier, ESC pour fermer.
            </p>
          </div>

          <!-- i18n -->
          <div id="feat-i18n" class="feature-card">
            <div class="feature-icon feature-icon--i18n">
              <div class="icon-shape icon-shape--i18n"></div>
            </div>
            <h3 class="feature-title">i18n complet</h3>
            <p class="feature-desc">
              Tous les textes configurables via <code>WanejoyhintLabels</code> avec templates.
            </p>
          </div>

          <!-- Events -->
          <div id="feat-events" class="feature-card">
            <div class="feature-icon feature-icon--events">
              <div class="icon-shape icon-shape--events"></div>
            </div>
            <h3 class="feature-title">5 types d'evenements</h3>
            <p class="feature-desc">
              <code>next</code>, <code>click</code>, <code>key</code>, <code>custom</code>, <code>auto</code>. Callbacks par etape.
            </p>
          </div>

          <!-- API -->
          <div id="feat-api" class="feature-card">
            <div class="feature-icon feature-icon--api">
              <div class="icon-shape icon-shape--api"></div>
            </div>
            <h3 class="feature-title">API programmatique</h3>
            <p class="feature-desc">
              <code>next()</code>, <code>prev()</code>, <code>trigger()</code>, <code>reRun()</code>, observables RxJS.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Install Section -->
    <section id="install-section" class="install">
      <div class="section-container">
        <h2 class="section-title">Installation rapide</h2>
        <p class="section-subtitle">Operationnel en moins de 5 minutes.</p>

        <div class="install-code-block">
          <div class="install-code-header">
            <span class="install-code-label">Terminal</span>
            <div class="install-code-dots">
              <span class="dot dot--red"></span>
              <span class="dot dot--yellow"></span>
              <span class="dot dot--green"></span>
            </div>
          </div>
          <pre class="install-code"><code>npm install wanejoyhint</code></pre>
        </div>

        <div class="install-steps">
          <div class="install-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4 class="step-title">Installez</h4>
              <p class="step-desc">Ajoutez le package via npm ou yarn.</p>
            </div>
          </div>
          <div class="install-step-arrow" aria-hidden="true">&#8594;</div>
          <div class="install-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4 class="step-title">Configurez</h4>
              <p class="step-desc">Ajoutez <code>provideWanejoyhint()</code> dans vos providers.</p>
            </div>
          </div>
          <div class="install-step-arrow" aria-hidden="true">&#8594;</div>
          <div class="install-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4 class="step-title">Lancez</h4>
              <p class="step-desc">Injectez <code>WanejoyhintService</code> et appelez <code>start(steps)</code>.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Bar -->
    <section id="stats-bar" class="stats">
      <div class="stats-container">
        <div class="stat-item">
          <span class="stat-value">0</span>
          <span class="stat-label">dependance jQuery</span>
        </div>
        <div class="stat-divider" aria-hidden="true"></div>
        <div class="stat-item">
          <span class="stat-value">Angular 18+</span>
          <span class="stat-label">compatibilite garantie</span>
        </div>
        <div class="stat-divider" aria-hidden="true"></div>
        <div class="stat-item">
          <span class="stat-value">WCAG AA</span>
          <span class="stat-label">accessibilite certifiee</span>
        </div>
        <div class="stat-divider" aria-hidden="true"></div>
        <div class="stat-item">
          <span class="stat-value">56</span>
          <span class="stat-label">tests automatises</span>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* ------------------------------------------------------------------ */
    /* Global resets scoped to this component                              */
    /* ------------------------------------------------------------------ */
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
      color: #1a1a2e;
      line-height: 1.6;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.85em;
      background: rgba(30, 205, 151, 0.12);
      color: #0e9a6e;
      padding: 0.1em 0.35em;
      border-radius: 4px;
    }

    /* ------------------------------------------------------------------ */
    /* Hero                                                                */
    /* ------------------------------------------------------------------ */
    .hero {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 90vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 24px 80px;
      gap: 64px;
      position: relative;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 60% 50% at 70% 50%, rgba(30, 205, 151, 0.08) 0%, transparent 70%),
        radial-gradient(ellipse 40% 40% at 20% 80%, rgba(30, 205, 151, 0.05) 0%, transparent 60%);
      pointer-events: none;
    }

    .hero-content {
      flex: 1;
      max-width: 580px;
      z-index: 1;
    }

    .hero-badge {
      display: inline-block;
      background: rgba(30, 205, 151, 0.15);
      color: #1ecd97;
      border: 1px solid rgba(30, 205, 151, 0.3);
      border-radius: 20px;
      padding: 4px 14px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .hero-title {
      font-size: clamp(2.2rem, 5vw, 3.6rem);
      font-weight: 800;
      line-height: 1.15;
      color: #ffffff;
      margin-bottom: 20px;
      letter-spacing: -0.02em;
    }

    .hero-title-accent {
      color: #1ecd97;
    }

    .hero-subtitle {
      font-size: clamp(1rem, 2vw, 1.2rem);
      color: rgba(255, 255, 255, 0.68);
      margin-bottom: 40px;
      max-width: 480px;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      text-decoration: none;
      transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
      white-space: nowrap;
    }

    .btn:focus-visible {
      outline: 3px solid #1ecd97;
      outline-offset: 3px;
    }

    .btn-primary {
      background: #1ecd97;
      color: #0f1e17;
    }

    .btn-primary:hover {
      background: #17b882;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(30, 205, 151, 0.35);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.14);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    }

    .btn-icon {
      font-size: 0.85em;
    }

    /* Hero visual decorative element */
    .hero-visual {
      flex-shrink: 0;
      z-index: 1;
    }

    .hero-visual-card {
      width: 260px;
      height: 200px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: relative;
      backdrop-filter: blur(12px);
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
    }

    .visual-bar {
      height: 10px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      width: 100%;
    }

    .visual-bar--short {
      width: 65%;
    }

    .visual-tooltip {
      position: absolute;
      bottom: -28px;
      right: 20px;
      background: #1ecd97;
      border-radius: 10px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 24px rgba(30, 205, 151, 0.4);
    }

    .visual-tooltip-dot {
      width: 8px;
      height: 8px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
    }

    .visual-tooltip-text {
      width: 80px;
      height: 8px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 4px;
    }

    /* ------------------------------------------------------------------ */
    /* Features                                                            */
    /* ------------------------------------------------------------------ */
    .features {
      background: #ffffff;
      padding: 96px 24px;
    }

    .section-container {
      max-width: 1100px;
      margin: 0 auto;
    }

    .section-title {
      font-size: clamp(1.75rem, 3vw, 2.4rem);
      font-weight: 800;
      text-align: center;
      color: #1a1a2e;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }

    .section-subtitle {
      text-align: center;
      color: #5a6472;
      font-size: 1.05rem;
      margin-bottom: 56px;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .feature-card {
      background: #ffffff;
      border: 1px solid #e8ecf0;
      border-radius: 16px;
      padding: 28px 24px;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
      border-color: rgba(30, 205, 151, 0.35);
    }

    .feature-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .feature-icon--svg    { background: rgba(30, 205, 151, 0.12); }
    .feature-icon--responsive { background: rgba(99, 102, 241, 0.12); }
    .feature-icon--a11y   { background: rgba(249, 115, 22, 0.12); }
    .feature-icon--i18n   { background: rgba(14, 165, 233, 0.12); }
    .feature-icon--events { background: rgba(168, 85, 247, 0.12); }
    .feature-icon--api    { background: rgba(234, 179, 8, 0.12); }

    .icon-shape {
      border-radius: 3px;
    }

    .icon-shape--svg {
      width: 22px;
      height: 22px;
      border: 2.5px solid #1ecd97;
      border-radius: 4px;
      position: relative;
    }

    .icon-shape--svg::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      right: 3px;
      bottom: 3px;
      background: rgba(30, 205, 151, 0.4);
      border-radius: 2px;
    }

    .icon-shape--responsive {
      width: 18px;
      height: 22px;
      border: 2.5px solid #6366f1;
      border-radius: 3px;
      position: relative;
    }

    .icon-shape--responsive::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
      width: 6px;
      height: 2px;
      background: #6366f1;
      border-radius: 1px;
    }

    .icon-shape--a11y {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2.5px solid #f97316;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-shape--a11y::after {
      content: '';
      width: 6px;
      height: 6px;
      background: #f97316;
      border-radius: 50%;
    }

    .icon-shape--i18n {
      width: 22px;
      height: 16px;
      border-bottom: 2.5px solid #0ea5e9;
      border-left: 2.5px solid #0ea5e9;
      position: relative;
    }

    .icon-shape--i18n::before {
      content: '';
      position: absolute;
      top: 0;
      left: 4px;
      width: 14px;
      height: 2px;
      background: #0ea5e9;
      border-radius: 1px;
    }

    .icon-shape--events {
      width: 8px;
      height: 8px;
      background: #a855f7;
      border-radius: 50%;
      box-shadow: 10px -4px 0 #a855f7, 10px 8px 0 #a855f7;
    }

    .icon-shape--api {
      width: 22px;
      height: 14px;
      border: 2px solid #eab308;
      border-radius: 7px;
      position: relative;
    }

    .icon-shape--api::before {
      content: '';
      position: absolute;
      left: 3px;
      top: 50%;
      transform: translateY(-50%);
      width: 5px;
      height: 5px;
      background: #eab308;
      border-radius: 50%;
    }

    .feature-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 8px;
    }

    .feature-desc {
      font-size: 0.9rem;
      color: #5a6472;
      line-height: 1.65;
    }

    /* ------------------------------------------------------------------ */
    /* Install Section                                                     */
    /* ------------------------------------------------------------------ */
    .install {
      background: #f5f7fa;
      padding: 96px 24px;
    }

    .install-code-block {
      max-width: 560px;
      margin: 0 auto 48px;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .install-code-header {
      background: #2d3748;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .install-code-label {
      color: rgba(255, 255, 255, 0.45);
      font-size: 0.75rem;
      font-family: 'SFMono-Regular', Consolas, monospace;
      letter-spacing: 0.05em;
    }

    .install-code-dots {
      display: flex;
      gap: 6px;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .dot--red    { background: #ff5f57; }
    .dot--yellow { background: #febc2e; }
    .dot--green  { background: #28c840; }

    .install-code {
      background: #1a202c;
      padding: 24px 28px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 1.1rem;
      color: #1ecd97;
      line-height: 1.5;
      overflow-x: auto;
    }

    .install-code code {
      background: transparent;
      color: inherit;
      font-size: inherit;
      padding: 0;
    }

    .install-steps {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .install-step {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      background: #ffffff;
      border: 1px solid #e8ecf0;
      border-radius: 14px;
      padding: 20px 22px;
      max-width: 220px;
      flex: 1;
      min-width: 160px;
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1ecd97, #0e9a6e);
      color: #ffffff;
      font-weight: 800;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .step-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 4px;
    }

    .step-desc {
      font-size: 0.82rem;
      color: #5a6472;
      line-height: 1.5;
    }

    .install-step-arrow {
      color: #c4cdd6;
      font-size: 1.4rem;
      padding-top: 24px;
      flex-shrink: 0;
    }

    /* ------------------------------------------------------------------ */
    /* Stats Bar                                                           */
    /* ------------------------------------------------------------------ */
    .stats {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 56px 24px;
    }

    .stats-container {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 40px;
      gap: 4px;
    }

    .stat-value {
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 800;
      color: #1ecd97;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }

    .stat-label {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
      text-align: center;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .stat-divider {
      width: 1px;
      height: 48px;
      background: rgba(255, 255, 255, 0.1);
      flex-shrink: 0;
    }

    /* ------------------------------------------------------------------ */
    /* Responsive                                                          */
    /* ------------------------------------------------------------------ */
    @media (max-width: 960px) {
      .feature-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .hero {
        flex-direction: column;
        text-align: center;
        padding: 60px 24px 80px;
        gap: 48px;
        min-height: auto;
      }

      .hero-subtitle {
        max-width: 100%;
      }

      .hero-actions {
        justify-content: center;
      }

      .hero-visual-card {
        width: 220px;
        height: 170px;
      }
    }

    @media (max-width: 640px) {
      .feature-grid {
        grid-template-columns: 1fr;
      }

      .features,
      .install,
      .stats {
        padding: 64px 16px;
      }

      .hero {
        padding: 48px 16px 64px;
      }

      .hero-visual {
        display: none;
      }

      .install-steps {
        flex-direction: column;
        align-items: center;
      }

      .install-step-arrow {
        transform: rotate(90deg);
        padding: 0;
        line-height: 1;
      }

      .install-step {
        max-width: 100%;
        width: 100%;
      }

      .stats-container {
        flex-direction: column;
        gap: 0;
      }

      .stat-divider {
        width: 48px;
        height: 1px;
      }

      .stat-item {
        padding: 20px 24px;
      }
    }
  `],
})
export class HomeComponent implements OnDestroy {
  private readonly hint = inject(WanejoyhintService);

  private readonly steps: WanejoyhintStep[] = [
    {
      selector: '#hero',
      description: 'Bienvenue ! Decouvrez Wanejoyhint, votre bibliotheque de tutoriels interactifs pour Angular.',
      eventType: 'next',
    },
    {
      selector: '#feature-grid',
      description: "Toutes les fonctionnalites cles en un coup d'oeil.",
      eventType: 'next',
      showPrev: true,
    },
    {
      selector: '#feat-svg',
      description: "L'overlay utilise un masque SVG pour decouper l'element cible — <b>rect</b> ou <b>circle</b>.",
      shape: 'rect',
      eventType: 'next',
      showPrev: true,
    },
    {
      selector: '#install-section',
      description: 'Installation en une seule commande npm.',
      eventType: 'next',
      showPrev: true,
    },
    {
      selector: '#stats-bar',
      description: 'Zero jQuery, Angular 18+, accessible et teste. <b>Pret pour la production !</b>',
      eventType: 'next',
      showPrev: true,
    },
  ];

  startQuickTour(): void {
    this.hint.setSteps(this.steps);
    this.hint.run({
      onStart: () => console.log('Tour demarre'),
      onEnd: () => console.log('Tour termine'),
    });
  }

  ngOnDestroy(): void {
    this.hint.stop();
  }
}
