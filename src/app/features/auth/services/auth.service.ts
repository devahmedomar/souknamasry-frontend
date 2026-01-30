import { inject, Injectable, signal, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';

export interface LoginCredentials {
    phone: string;
    password: string;
    recaptchaToken: string | null;
}

export interface RegisterData {
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    recaptchaToken: string | null;
}

export interface LoginResponse {
    status: string;
    data: {
        token: string;
        user: any;
    };
}

export interface LogoutResponse {
    status: string;
    data: {
        message: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);
    private baseUrl = `${environment.apiUrl}auth`;

    token = signal<string | null>(null);
    currentUser = signal<any | null>(null);

    constructor() {
        this.loadAuthData();
    }

    login(credentials: LoginCredentials): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials);
    }

    register(userData: RegisterData): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/register`, userData);
    }

    logout(): Observable<LogoutResponse | null> {
        return this.http.post<LogoutResponse>(`${this.baseUrl}/logout`, {}).pipe(
            tap(() => this.clearAuthData()),
            catchError(() => {
                // Clear auth data even if API call fails
                this.clearAuthData();
                return of(null);
            })
        );
    }

    saveAuthData(token: string, user: any) {
        this.token.set(token);
        this.currentUser.set(user);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        }
    }

    clearAuthData() {
        this.token.set(null);
        this.currentUser.set(null);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    private loadAuthData() {
        if (isPlatformBrowser(this.platformId)) {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');

            if (token) {
                this.token.set(token);
            }
            if (user) {
                try {
                    const parsedUser = JSON.parse(user);
                    this.currentUser.set(parsedUser);
                } catch (e) {
                    console.error('Error parsing user data from localStorage', e);
                }
            }
        }
    }
}
