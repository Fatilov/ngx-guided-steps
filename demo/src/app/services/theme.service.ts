import { Injectable, signal, computed, effect } from '@angular/core';

export type SiteTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private theme = signal<SiteTheme>(this.getInitialTheme());

  isDark = computed(() => this.theme() === 'dark');
  current = computed(() => this.theme());

  constructor() {
    effect(() => {
      const value = this.theme();
      document.documentElement.setAttribute('data-theme', value);
      localStorage.setItem('site-theme', value);
    });
  }

  toggleTheme(): void {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
  }

  private getInitialTheme(): SiteTheme {
    const stored = localStorage.getItem('site-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }
}
