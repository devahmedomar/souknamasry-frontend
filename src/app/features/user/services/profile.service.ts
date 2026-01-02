import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User, UpdateProfileRequest, UserResponse } from '../../../shared/models/user.interface';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}users`;

    getProfile(): Observable<UserResponse> {
        return this.http.get<UserResponse>(`${this.baseUrl}/profile`);
    }

    updateProfile(data: UpdateProfileRequest): Observable<UserResponse> {
        return this.http.put<UserResponse>(`${this.baseUrl}/profile`, data);
    }
}
