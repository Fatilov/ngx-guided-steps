import { Component } from '@angular/core';

@Component({
  selector: 'app-advanced',
  standalone: true,
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Reference API avancee</h1>
        <p>Documentation des fonctionnalites avancees de Wanejoyhint.</p>
      </header>

      <section class="card">
        <h2>Internationalisation (i18n)</h2>
        <p>Personnalisez tous les textes via <code>setConfig()</code> :</p>
        <pre class="code-block"><code [innerHTML]="codeI18n"></code></pre>
      </section>

      <section class="card">
        <h2>Themes</h2>
        <p>Deux themes integres : <code>light</code> (defaut) et <code>dark</code>.</p>
        <pre class="code-block"><code [innerHTML]="codeTheme"></code></pre>
      </section>

      <section class="card">
        <h2>Navigation cross-routes</h2>
        <p>Naviguez entre les pages pendant un tour grace a la propriete <code>route</code> et au token <code>WANEJOYHINT_ROUTER</code>.</p>
        <pre class="code-block"><code [innerHTML]="codeCrossRoute"></code></pre>
      </section>

      <section class="card">
        <h2>Backdrop dismiss et navigation clavier</h2>
        <p>Activez la fermeture par clic sur l'overlay et la navigation par fleches :</p>
        <pre class="code-block"><code [innerHTML]="codeBackdrop"></code></pre>
        <p>Touches supportees : <kbd>&#8592;</kbd> precedent, <kbd>&#8594;</kbd> suivant, <kbd>Echap</kbd> fermer.</p>
      </section>

      <section class="card">
        <h2>Observables RxJS</h2>
        <p>Abonnez-vous aux evenements du tour :</p>
        <pre class="code-block"><code [innerHTML]="codeObservables"></code></pre>
      </section>

      <section class="card">
        <h2>API programmatique</h2>
        <p>Controlez le tour par code :</p>
        <pre class="code-block"><code [innerHTML]="codeApi"></code></pre>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .page {
      max-width: 760px;
      margin: 0 auto;
      padding: 40px 20px 80px;
    }

    .page-header {
      margin-bottom: 36px;
    }

    .page-header h1 {
      font-size: 1.8em;
      color: #1a1a2e;
      margin-bottom: 6px;
    }

    .page-header p {
      color: #666;
      font-size: 15px;
    }

    .card {
      background: white;
      border: 1px solid #e8ecf0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
    }

    .card h2 {
      font-size: 1.15em;
      color: #1a1a2e;
      margin-bottom: 10px;
    }

    .card p {
      color: #555;
      font-size: 14px;
      margin-bottom: 12px;
      line-height: 1.6;
    }

    code {
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
      font-family: 'SFMono-Regular', Consolas, monospace;
    }

    kbd {
      background: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 1px 6px;
      font-size: 13px;
      font-family: 'SFMono-Regular', Consolas, monospace;
    }

    .code-block {
      background: #0d1117;
      color: #c9d1d9;
      padding: 16px;
      border-radius: 8px;
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 13px;
      overflow-x: auto;
      line-height: 1.6;
      margin-bottom: 8px;
    }

    .code-block code {
      background: none;
      padding: 0;
      color: inherit;
      font-size: inherit;
    }

    @media (max-width: 640px) {
      .page { padding: 24px 16px 60px; }
      .page-header h1 { font-size: 1.4em; }
      .card { padding: 18px; }
    }
  `],
})
export class AdvancedComponent {
  codeI18n = `hint.setConfig({
  labels: {
    next: 'Suivant',
    prev: 'Precedent',
    skip: 'Passer',
    progress: '{{current}} sur {{total}}'
  }
});`;

  codeTheme = `hint.setConfig({
  theme: 'dark',
  backgroundColor: 'rgba(255,255,255,0.85)'
});`;

  codeCrossRoute = `{
  selector: '#dashboard-stats',
  route: '/dashboard',
  waitForSelector: true,
  description: 'Cet element est sur une autre page.'
}`;

  codeBackdrop = `hint.setConfig({
  backdropDismiss: true,
  keyboardNav: true
});`;

  codeObservables = `hint.onStepChange.subscribe(({ index, step }) =&gt; ...);
hint.onEnd.subscribe(() =&gt; ...);
hint.onSkip.subscribe(() =&gt; ...);`;

  codeApi = `hint.next();        // etape suivante
hint.prev();        // etape precedente
hint.stop();        // arreter le tour
hint.isRunning;     // boolean
hint.getCurrentStep(); // index courant`;
}
