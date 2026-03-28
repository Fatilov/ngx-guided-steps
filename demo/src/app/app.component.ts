import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" id="navbar">
      <a class="navbar-brand" routerLink="/">
        <span class="brand-icon">&#9670;</span> Wanejoyhint
      </a>
      <div class="navbar-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" id="nav-home">Accueil</a>
        <a routerLink="/features" routerLinkActive="active" id="nav-features">Fonctionnalites</a>
        <a routerLink="/advanced" routerLinkActive="active" id="nav-advanced">Avance</a>
        <a routerLink="/dashboard" routerLinkActive="active" id="nav-dashboard">Dashboard</a>
      </div>
    </nav>
    <main>
      <router-outlet />
    </main>
    <footer class="footer" id="footer">
      <p>Wanejoyhint v1.1.0 &mdash; Bibliotheque Angular de tutoriels interactifs</p>
      <p class="footer-links">
        <a href="https://github.com/fatilov/wanejoyhint" target="_blank">GitHub</a>
        <span>&bull;</span>
        <a href="https://www.npmjs.com/package/wanejoyhint" target="_blank">npm</a>
      </p>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      height: 56px;
      background: #1a1a2e;
      color: white;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .navbar-brand {
      font-size: 18px;
      font-weight: 700;
      color: #1ecd97;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .brand-icon { font-size: 14px; }

    .navbar-links {
      display: flex;
      gap: 4px;
    }

    .navbar-links a {
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      font-size: 13px;
      padding: 6px 12px;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .navbar-links a:hover { color: white; background: rgba(255,255,255,0.1); }
    .navbar-links a.active { color: #1ecd97; background: rgba(30,205,151,0.1); }

    main { flex: 1; }

    .footer {
      text-align: center;
      padding: 24px 16px;
      background: #1a1a2e;
      color: rgba(255,255,255,0.5);
      font-size: 13px;
    }
    .footer p { margin: 4px 0; }
    .footer-links a { color: #1ecd97; text-decoration: none; }
    .footer-links span { margin: 0 8px; }

    @media (max-width: 640px) {
      .navbar { padding: 0 12px; height: 48px; }
      .navbar-brand { font-size: 15px; }
      .navbar-links a { font-size: 11px; padding: 4px 8px; }
    }
  `],
})
export class AppComponent {}
