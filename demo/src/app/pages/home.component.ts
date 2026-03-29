import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">Angular 18+</div>
        <h1 class="hero-title">Wanejoyhint</h1>
        <p class="hero-accent-subtitle">Tutoriels interactifs pour Angular 18+</p>
        <p class="hero-description">
          Overlays SVG, fleches animees, themes, i18n, navigation cross-routes.
          Zero dependance jQuery.
        </p>
        <div class="hero-actions">
          <a class="btn btn-primary" routerLink="/features">
            <span class="btn-icon">&#9654;</span>
            Lancer le parcours complet
          </a>
          <a class="btn btn-secondary" routerLink="/advanced">
            <span class="btn-icon">&#9671;</span>
            Documentation
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

    <!-- Quick Start Section -->
    <section class="quickstart">
      <div class="section-container">
        <h2 class="section-title">Demarrage rapide</h2>
        <p class="section-subtitle">Operationnel en 3 etapes.</p>

        <div class="steps-grid">
          <!-- Step 1 -->
          <div class="step-block">
            <div class="step-header">
              <div class="step-number">1</div>
              <h3 class="step-label">Installer</h3>
            </div>
            <div class="code-block">
              <div class="code-block-header">
                <span class="code-block-lang">Terminal</span>
                <div class="code-block-dots">
                  <span class="dot dot--red"></span>
                  <span class="dot dot--yellow"></span>
                  <span class="dot dot--green"></span>
                </div>
              </div>
              <pre class="code-block-body"><code>npm install wanejoyhint</code></pre>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="step-block">
            <div class="step-header">
              <div class="step-number">2</div>
              <h3 class="step-label">Configurer</h3>
            </div>
            <div class="code-block">
              <div class="code-block-header">
                <span class="code-block-lang">app.config.ts</span>
                <div class="code-block-dots">
                  <span class="dot dot--red"></span>
                  <span class="dot dot--yellow"></span>
                  <span class="dot dot--green"></span>
                </div>
              </div>
              <pre class="code-block-body"><code [innerHTML]="step2Code"></code></pre>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="step-block">
            <div class="step-header">
              <div class="step-number">3</div>
              <h3 class="step-label">Utiliser</h3>
            </div>
            <div class="code-block">
              <div class="code-block-header">
                <span class="code-block-lang">app.component.ts</span>
                <div class="code-block-dots">
                  <span class="dot dot--red"></span>
                  <span class="dot dot--yellow"></span>
                  <span class="dot dot--green"></span>
                </div>
              </div>
              <pre class="code-block-body"><code [innerHTML]="step3Code"></code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature Grid -->
    <section class="features">
      <div class="section-container">
        <h2 class="section-title">Tout ce dont vous avez besoin</h2>
        <p class="section-subtitle">Une bibliotheque complete pour les developpeurs Angular modernes.</p>
        <div class="feature-grid">
          <a class="feature-card" routerLink="/features">
            <div class="feature-icon feature-icon--svg">
              <div class="icon-shape icon-shape--svg"></div>
            </div>
            <h3 class="feature-title">Overlays SVG</h3>
            <p class="feature-desc">
              Decoupe masque SVG avec formes <code>circle</code> et <code>rect</code> autour des elements cibles.
            </p>
          </a>

          <a class="feature-card" routerLink="/features">
            <div class="feature-icon feature-icon--events">
              <div class="icon-shape icon-shape--events"></div>
            </div>
            <h3 class="feature-title">Evenements</h3>
            <p class="feature-desc">
              <code>click</code>, <code>key</code>, <code>custom</code>, <code>next</code> -- controle total du flux utilisateur.
            </p>
          </a>

          <a class="feature-card" routerLink="/features">
            <div class="feature-icon feature-icon--themes">
              <div class="icon-shape icon-shape--themes"></div>
            </div>
            <h3 class="feature-title">Themes</h3>
            <p class="feature-desc">
              Basculez entre dark et light ou creez vos propres themes personnalises.
            </p>
          </a>

          <a class="feature-card" routerLink="/features">
            <div class="feature-icon feature-icon--i18n">
              <div class="icon-shape icon-shape--i18n"></div>
            </div>
            <h3 class="feature-title">i18n</h3>
            <p class="feature-desc">
              Labels entierement personnalisables via <code>WanejoyhintLabels</code> et templates.
            </p>
          </a>

          <a class="feature-card" routerLink="/features">
            <div class="feature-icon feature-icon--routes">
              <div class="icon-shape icon-shape--routes"></div>
            </div>
            <h3 class="feature-title">Cross-routes</h3>
            <p class="feature-desc">
              Navigation entre pages avec continuite du parcours grace au Router Angular.
            </p>
          </a>

          <a class="feature-card" routerLink="/features">
            <div class="feature-icon feature-icon--api">
              <div class="icon-shape icon-shape--api"></div>
            </div>
            <h3 class="feature-title">API programmatique</h3>
            <p class="feature-desc">
              <code>next()</code>, <code>prev()</code>, <code>stop()</code>, observables RxJS complets.
            </p>
          </a>
        </div>
      </div>
    </section>

    <!-- Footer Stats Bar -->
    <section class="stats">
      <div class="stats-container">
        <div class="stat-item">
          <span class="stat-value">Angular 18+</span>
          <span class="stat-label">compatible</span>
        </div>
        <div class="stat-divider" aria-hidden="true"></div>
        <div class="stat-item">
          <span class="stat-value">TypeScript pur</span>
          <span class="stat-label">type-safe</span>
        </div>
        <div class="stat-divider" aria-hidden="true"></div>
        <div class="stat-item">
          <span class="stat-value">0 dependances</span>
          <span class="stat-label">autonome</span>
        </div>
        <div class="stat-divider" aria-hidden="true"></div>
        <div class="stat-item">
          <span class="stat-value">WCAG accessible</span>
          <span class="stat-label">inclusif</span>
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
      overflow-x: hidden;
      max-width: 100%;
    }

    *,
    *::before,
    *::after {
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
      overflow-wrap: break-word;
      word-break: break-all;
    }

    /* ------------------------------------------------------------------ */
    /* Hero                                                                */
    /* ------------------------------------------------------------------ */
    .hero {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 92vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
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
      max-width: 600px;
      min-width: 0;
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
      margin-bottom: 24px;
    }

    .hero-title {
      font-size: clamp(2.6rem, 6vw, 4rem);
      font-weight: 800;
      line-height: 1.1;
      color: #ffffff;
      margin-bottom: 12px;
      letter-spacing: -0.03em;
    }

    .hero-accent-subtitle {
      font-size: clamp(1.1rem, 2.5vw, 1.5rem);
      color: #1ecd97;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .hero-description {
      font-size: clamp(1rem, 2vw, 1.15rem);
      color: rgba(255, 255, 255, 0.65);
      margin-bottom: 40px;
      max-width: 500px;
      line-height: 1.7;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 28px;
      min-height: 44px;
      min-width: 44px;
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
    /* Quick Start                                                         */
    /* ------------------------------------------------------------------ */
    .quickstart {
      background: #f5f7fa;
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

    .steps-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 40px;
      max-width: 720px;
      margin: 0 auto;
    }

    .step-block {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .step-header {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .step-number {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1ecd97, #0e9a6e);
      color: #ffffff;
      font-weight: 800;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .step-label {
      font-size: 1.15rem;
      font-weight: 700;
      color: #1a1a2e;
    }

    .code-block {
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      max-width: 100%;
    }

    .code-block-header {
      background: #2d3748;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .code-block-lang {
      color: rgba(255, 255, 255, 0.45);
      font-size: 0.75rem;
      font-family: 'SFMono-Regular', Consolas, monospace;
      letter-spacing: 0.05em;
    }

    .code-block-dots {
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

    .code-block-body {
      background: #1a202c;
      padding: 20px 24px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.85rem;
      color: #cbd5e0;
      line-height: 1.65;
      overflow-x: auto;
      overflow-wrap: break-word;
      word-break: break-all;
      max-width: 100%;
      margin: 0;
    }

    .code-block-body code {
      background: transparent;
      color: inherit;
      font-size: inherit;
      padding: 0;
      font-family: inherit;
      word-break: break-all;
      overflow-wrap: break-word;
      white-space: pre-wrap;
    }

    /* ------------------------------------------------------------------ */
    /* Features                                                            */
    /* ------------------------------------------------------------------ */
    .features {
      background: #ffffff;
      padding: 96px 24px;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .feature-card {
      display: block;
      background: #ffffff;
      border: 1px solid #e8ecf0;
      border-radius: 16px;
      padding: 28px 24px;
      text-decoration: none;
      color: inherit;
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
    .feature-icon--events { background: rgba(168, 85, 247, 0.12); }
    .feature-icon--themes { background: rgba(249, 115, 22, 0.12); }
    .feature-icon--i18n   { background: rgba(14, 165, 233, 0.12); }
    .feature-icon--routes { background: rgba(99, 102, 241, 0.12); }
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

    .icon-shape--events {
      width: 8px;
      height: 8px;
      background: #a855f7;
      border-radius: 50%;
      box-shadow: 10px -4px 0 #a855f7, 10px 8px 0 #a855f7;
    }

    .icon-shape--themes {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1a1a2e 50%, #f97316 50%);
      border: 2px solid #f97316;
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

    .icon-shape--routes {
      width: 22px;
      height: 14px;
      position: relative;
    }

    .icon-shape--routes::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 10px;
      height: 10px;
      border: 2.5px solid #6366f1;
      border-radius: 3px;
    }

    .icon-shape--routes::after {
      content: '';
      position: absolute;
      bottom: 0;
      right: 0;
      width: 10px;
      height: 10px;
      border: 2.5px solid #6366f1;
      border-radius: 3px;
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
    /* Stats Bar                                                           */
    /* ------------------------------------------------------------------ */
    .stats {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 56px 24px;
    }

    .stats-container {
      max-width: 1000px;
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
      padding: 16px 36px;
      gap: 4px;
    }

    .stat-value {
      font-size: clamp(1.3rem, 2.5vw, 1.7rem);
      font-weight: 800;
      color: #1ecd97;
      letter-spacing: -0.02em;
      line-height: 1.1;
      white-space: nowrap;
    }

    .stat-label {
      font-size: 0.78rem;
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

      .hero-content {
        max-width: 100%;
      }

      .hero-description {
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

    @media (max-width: 768px) {
      .feature-grid {
        grid-template-columns: 1fr;
      }

      .features,
      .quickstart {
        padding: 72px 16px;
      }

      .stats {
        padding: 48px 16px;
      }

      .hero {
        padding: 48px 16px 64px;
      }

      .hero-visual {
        display: none;
      }

      .section-subtitle {
        margin-bottom: 36px;
      }

      .code-block-body {
        font-size: 0.78rem;
        padding: 16px 18px;
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
        padding: 16px 24px;
      }

      .btn {
        padding: 12px 22px;
        font-size: 0.95rem;
      }

      .hero-actions {
        flex-direction: column;
        align-items: center;
        width: 100%;
      }

      .hero-actions .btn {
        width: 100%;
        max-width: 320px;
        justify-content: center;
      }

      .step-label {
        font-size: 1.05rem;
      }

      .feature-card {
        padding: 22px 18px;
      }
    }

    @media (max-width: 480px) {
      .hero {
        padding: 36px 12px 48px;
      }

      .features,
      .quickstart {
        padding: 48px 12px;
      }

      .stats {
        padding: 36px 12px;
      }

      .hero-badge {
        font-size: 0.7rem;
        padding: 3px 10px;
        margin-bottom: 16px;
      }

      .hero-description {
        margin-bottom: 28px;
      }

      .section-title {
        font-size: 1.5rem;
      }

      .section-subtitle {
        font-size: 0.95rem;
        margin-bottom: 28px;
      }

      .code-block-body {
        font-size: 0.7rem;
        padding: 12px 10px;
      }

      .code-block-body code {
        font-size: 0.7rem;
      }

      .code-block-header {
        padding: 8px 10px;
      }

      .code-block-lang {
        font-size: 0.68rem;
      }

      .dot {
        width: 9px;
        height: 9px;
      }

      .stat-value {
        font-size: 1.1rem;
      }

      .stat-label {
        font-size: 0.7rem;
      }

      .stat-item {
        padding: 12px 16px;
      }

      .feature-card {
        padding: 18px 14px;
      }

      .feature-title {
        font-size: 0.95rem;
      }

      .feature-desc {
        font-size: 0.85rem;
      }

      .steps-grid {
        gap: 28px;
      }

      .btn {
        padding: 12px 18px;
        font-size: 0.9rem;
      }
    }
  `],
})
export class HomeComponent {
  step2Code = `import { provideWanejoyhint, WANEJOYHINT_ROUTER } from 'wanejoyhint';
import { provideRouter, Router } from '@angular/router';

export const appConfig = {
  providers: [
    provideRouter(routes),
    provideWanejoyhint({
      showProgress: true,
      labels: { next: 'Suivant', prev: 'Precedent', skip: 'Passer' },
    }),
    { provide: WANEJOYHINT_ROUTER, useExisting: Router },
  ],
};`;

  step3Code = `import { WanejoyhintService, WanejoyhintStep } from 'wanejoyhint';

export class AppComponent {
  private hint = inject(WanejoyhintService);

  startTour() {
    this.hint.setSteps([
      { selector: '#header', description: 'Bienvenue !', eventType: 'next' },
      { selector: '#nav', description: 'La navigation.', eventType: 'next' },
    ]);
    this.hint.run();
  }
}`;
}
