import { inject, Injectable, signal, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface LoginResponse {
    status: string;
    data: {
        token: string;
        user: any;
    };
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);
    private baseUrl = 'https://souknamasry-be.vercel.app/api/auth';

    token = signal<string | null>(null);
    currentUser = signal<any | null>(null);

    constructor() {
        this.loadAuthData();
    }

    login(credentials: any): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials);
    }

    register(userData: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/register`, userData);
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
            if (token) this.token.set(token);
            if (user) {
                try {
                    this.currentUser.set(JSON.parse(user));
                } catch (e) {
                    console.error('Error parsing user data from localStorage', e);
                }
            }
        }
    }
}
