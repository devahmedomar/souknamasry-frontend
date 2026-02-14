import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SiteTheme {
  key: string;
  nameAr: string;
  nameEn: string;
  isEnabled: boolean;
  isBuiltIn?: boolean;
}

export interface AdminSettings {
  activeTheme: string;
  themes: SiteTheme[];
}

export interface CreateThemeDto {
  key: string;
  nameAr: string;
  nameEn: string;
  isEnabled?: boolean;
}

export interface UpdateThemeDto {
  nameAr?: string;
  nameEn?: string;
  isEnabled?: boolean;
}

interface SettingsEnvelope {
  status: string;
  data: { settings: AdminSettings };
}

interface ThemeEnvelope {
  status: string;
  data: { theme: SiteTheme };
}

@Injectable({ providedIn: 'root' })
export class SiteThemeAdminService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  getSettings(): Observable<AdminSettings> {
    return this.http
      .get<SettingsEnvelope>(`${this.api}admin/settings`)
      .pipe(map((res) => res.data.settings));
  }

  setActiveTheme(key: string): Observable<AdminSettings> {
    return this.http
      .patch<SettingsEnvelope>(`${this.api}admin/settings/theme`, { activeTheme: key })
      .pipe(map((res) => res.data.settings));
  }

  createTheme(dto: CreateThemeDto): Observable<SiteTheme> {
    return this.http
      .post<ThemeEnvelope>(`${this.api}admin/settings/themes`, dto)
      .pipe(map((res) => res.data.theme));
  }

  updateTheme(key: string, dto: UpdateThemeDto): Observable<SiteTheme> {
    return this.http
      .put<ThemeEnvelope>(`${this.api}admin/settings/themes/${key}`, dto)
      .pipe(map((res) => res.data.theme));
  }

  deleteTheme(key: string): Observable<void> {
    return this.http.delete<void>(`${this.api}admin/settings/themes/${key}`);
  }
}
