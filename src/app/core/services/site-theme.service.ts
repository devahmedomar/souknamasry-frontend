import { Injectable, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ActiveThemeFlat {
  activeTheme: string;
}

interface ActiveThemeEnvelope {
  status: string;
  data: { activeTheme: string };
}

@Injectable({ providedIn: 'root' })
export class SiteThemeService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly api = environment.apiUrl;

  activeTheme = signal<string>('normal');

  /** True when the active theme is "normal" — no seasonal decorations should render */
  isDefaultTheme = computed(() => this.activeTheme() === 'normal');

  loadActiveTheme(): void {
    this.http.get<ActiveThemeEnvelope | ActiveThemeFlat>(`${this.api}settings/theme`).subscribe({
      next: (res) => {
        // Handle both { activeTheme } and { data: { activeTheme } } shapes
        const theme =
          'data' in res && res.data?.activeTheme
            ? res.data.activeTheme
            : (res as ActiveThemeFlat).activeTheme;
        if (theme) {
          this.activeTheme.set(theme);
          this.applyToDOM(theme);
        }
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
