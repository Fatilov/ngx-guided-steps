import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="dashboard">
      <header class="dashboard-header" id="dashboard-header">
        <h1>Dashboard</h1>
        <p>Page cible pour la demonstration de navigation cross-routes</p>
      </header>

      <div class="dashboard-grid">
        <div class="dashboard-card" id="dashboard-stats">
          <h3>Statistiques</h3>
          <div class="stat-row">
            <div class="stat"><span class="stat-value">1,234</span><span class="stat-label">Utilisateurs</span></div>
            <div class="stat"><span class="stat-value">56</span><span class="stat-label">Tests</span></div>
            <div class="stat"><span class="stat-value">99.9%</span><span class="stat-label">Uptime</span></div>
          </div>
        </div>

        <div class="dashboard-card" id="dashboard-chart">
          <h3>Graphique</h3>
          <div class="chart-placeholder">
            <div class="bar" style="height: 40%"></div>
            <div class="bar" style="height: 70%"></div>
            <div class="bar" style="height: 55%"></div>
            <div class="bar" style="height: 85%"></div>
            <div class="bar" style="height: 60%"></div>
            <div class="bar" style="height: 90%"></div>
          </div>
        </div>

        <div class="dashboard-card" id="dashboard-activity">
          <h3>Activite recente</h3>
          <ul class="activity-list">
            <li><span class="dot green"></span> Deploiement v1.1.0 reussi</li>
            <li><span class="dot blue"></span> 8 nouveaux tests ajoutes</li>
            <li><span class="dot orange"></span> PR #6 en revue</li>
            <li><span class="dot green"></span> Build CI passe</li>
          </ul>
        </div>
      </div>

      <div class="back-link">
        <a routerLink="/advanced">← Retour a la page Avance</a>
      </div>
    </div>
  `,
  styles: `
    .dashboard {
      max-width: 900px;
      margin: auto;
      padding: 30px 20px;
    }

    .dashboard-header {
      margin-bottom: 30px;
    }

    .dashboard-header h1 {
      font-size: 1.8em;
      color: var(--site-text);
    }

    .dashboard-header p {
      color: var(--site-text-secondary);
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
    }

    .dashboard-card {
      background: var(--site-surface);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 12px var(--site-shadow);
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }

    .dashboard-card h3 {
      margin-bottom: 16px;
      font-size: 1em;
      color: var(--site-text);
    }

    .stat-row {
      display: flex;
      gap: 20px;
      justify-content: space-around;
    }

    .stat {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 1.6em;
      font-weight: 700;
      color: var(--site-accent);
    }

    .stat-label {
      font-size: 12px;
      color: var(--site-text-tertiary);
    }

    .chart-placeholder {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      height: 120px;
      padding: 10px 0;
    }

    .bar {
      flex: 1;
      background: linear-gradient(to top, var(--site-accent), var(--site-accent-hover));
      border-radius: 4px 4px 0 0;
      transition: height 0.3s;
    }

    .activity-list {
      list-style: none;
      padding: 0;
    }

    .activity-list li {
      padding: 8px 0;
      border-bottom: 1px solid var(--site-surface-border);
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }

    .dot.green {
      background: var(--site-accent);
    }

    .dot.blue {
      background: var(--site-accent-secondary);
    }

    .dot.orange {
      background: #ffa726;
    }

    .back-link {
      margin-top: 30px;
      text-align: center;
    }

    .back-link a {
      color: var(--site-accent);
      text-decoration: none;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .dashboard {
        padding: 20px 12px;
      }
      .dashboard-header h1 {
        font-size: 1.4em;
      }
      .dashboard-grid {
        grid-template-columns: 1fr;
        gap: 14px;
      }
      .dashboard-card {
        padding: 16px;
      }
      .stat-value {
        font-size: 1.3em;
      }
      .stat-row {
        gap: 12px;
      }
      .chart-placeholder {
        height: 100px;
        gap: 8px;
      }
      .activity-list li {
        font-size: 13px;
      }
    }
  `
})
export class DashboardComponent {}
