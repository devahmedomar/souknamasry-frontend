import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SiteTheme {
  key: string;
  nameAr: string;
  nameEn: string;
  isEnabled: boolean;
  isBuiltIn: boolean;
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

@Injectable({ providedIn: 'root' })
export class SiteThemeAdminService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  getSettings(): Observable<AdminSettings> {
    return this.http.get<AdminSettings>(`${this.api}admin/settings`);
  }

  setActiveTheme(key: string): Observable<AdminSettings> {
    return this.http.patch<AdminSettings>(`${this.api}admin/settings/theme`, { activeTheme: key });
  }

  createTheme(dto: CreateThemeDto): Observable<SiteTheme> {
    return this.http.post<SiteTheme>(`${this.api}admin/settings/themes`, dto);
  }

  updateTheme(key: string, dto: UpdateThemeDto): Observable<SiteTheme> {
    return this.http.put<SiteTheme>(`${this.api}admin/settings/themes/${key}`, dto);
  }

  deleteTheme(key: string): Observable<void> {
    return this.http.delete<void>(`${this.api}admin/settings/themes/${key}`);
  }
}
