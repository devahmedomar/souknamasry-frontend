import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
    token: string;
    user: any;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private baseUrl = 'https://souknamasry-be.vercel.app/api/auth';

    login(credentials: any): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials);
    }

    register(userData: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/register`, userData);
    }
}
