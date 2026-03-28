import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent) },
  { path: 'features', loadComponent: () => import('./pages/features.component').then(m => m.FeaturesComponent) },
  { path: 'advanced', loadComponent: () => import('./pages/advanced.component').then(m => m.AdvancedComponent) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent) },
  { path: '**', redirectTo: '' },
];
