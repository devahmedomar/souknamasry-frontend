import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ActiveThemeResponse {
  activeTheme: string;
}

@Injectable({ providedIn: 'root' })
export class SiteThemeService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly api = environment.apiUrl;

  activeTheme = signal<string>('default');

  loadActiveTheme(): void {
    this.http.get<ActiveThemeResponse>(`${this.api}settings/theme`).subscribe({
      next: (res) => {
        this.activeTheme.set(res.activeTheme);
        this.applyToDOM(res.activeTheme);
      },
      error: () => {
        // Silently fall back to default; site still functions
      },
    });
  }

  applyToDOM(theme: string): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('data-site-theme', theme);
    }
  }
}
