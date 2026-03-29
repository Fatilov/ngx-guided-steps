import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from './components/theme-toggle.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ThemeToggleComponent],
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
        <app-theme-toggle></app-theme-toggle>
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
      overflow-x: hidden;
    }

    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      height: 56px;
      background: var(--site-chrome-bg);
      color: var(--site-chrome-text);
      position: sticky;
      top: 0;
      z-index: 100;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    .navbar-brand {
      font-size: 18px;
      font-weight: 700;
      color: var(--site-accent);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .brand-icon { font-size: 14px; }

    .navbar-links {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }

    .navbar-links a {
      color: var(--site-chrome-text-muted);
      text-decoration: none;
      font-size: 13px;
      padding: 6px 12px;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .navbar-links a:hover { color: var(--site-chrome-text); background: rgba(255,255,255,0.1); }
    .navbar-links a.active { color: var(--site-accent); background: rgba(30,205,151,0.1); }

    main { flex: 1; }

    .footer {
      text-align: center;
      padding: 24px 16px;
      background: var(--site-chrome-bg);
      color: var(--site-chrome-text-muted);
      font-size: 13px;
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    .footer p { margin: 4px 0; }
    .footer-links a { color: var(--site-accent); text-decoration: none; }
    .footer-links span { margin: 0 8px; }

    @media (max-width: 768px) {
      .navbar {
        padding: 8px 12px;
        height: auto;
        min-height: 48px;
        flex-wrap: wrap;
        gap: 4px;
      }
      .navbar-brand { font-size: 15px; }
      .navbar-links {
        gap: 2px;
        justify-content: flex-end;
      }
      .navbar-links a { font-size: 11px; padding: 4px 6px; }
      .footer {
        flex-direction: column;
        padding: 16px 12px;
        font-size: 12px;
      }
      .footer-links {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 4px;
      }
    }

    @media (max-width: 480px) {
      .navbar {
        justify-content: center;
        gap: 6px;
      }
      .navbar-brand { font-size: 14px; }
      .navbar-links {
        width: 100%;
        justify-content: center;
        gap: 2px;
      }
      .navbar-links a { font-size: 10px; padding: 4px 5px; }
    }
  `],
})
export class AppComponent {}
