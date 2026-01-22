import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  UsersResponse,
  UserResponse,
  UserStatisticsResponse,
  UserQueryParams,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserAdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}admin/users`;

  /**
   * Get user statistics for dashboard
   * GET /api/admin/users/statistics
   */
  getUserStatistics(): Observable<UserStatisticsResponse> {
    return this.http.get<UserStatisticsResponse>(`${this.apiUrl}/statistics`);
  }

  /**
   * Get all users with pagination and filtering
   * GET /api/admin/users?page=1&limit=20&role=customer&isActive=true&search=john
   */
  getAllUsers(params: UserQueryParams = {}): Observable<UsersResponse> {
    let httpParams = new HttpParams();

    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.role) {
      httpParams = httpParams.set('role', params.role);
    }
    if (params.isActive !== undefined) {
      httpParams = httpParams.set('isActive', params.isActive.toString());
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<UsersResponse>(this.apiUrl, { params: httpParams });
  }

  /**
   * Get user by ID
   * GET /api/admin/users/:id
   */
  getUserById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new user
   * POST /api/admin/users
   */
  createUser(data: CreateUserDto): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.apiUrl, data);
  }

  /**
   * Update user
   * PUT /api/admin/users/:id
   */
  updateUser(id: string, data: UpdateUserDto): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Update user role
   * PATCH /api/admin/users/:id/role
   */
  updateUserRole(
    id: string,
    data: UpdateUserRoleDto
  ): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}/role`, data);
  }

  /**
   * Activate user
   * PATCH /api/admin/users/:id/activate
   */
  activateUser(id: string): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}/activate`, {});
  }

  /**
   * Deactivate user (soft delete)
   * PATCH /api/admin/users/:id/deactivate
   */
  deactivateUser(id: string): Observable<UserResponse> {
    return this.http.patch<UserResponse>(
      `${this.apiUrl}/${id}/deactivate`,
      {}
    );
  }

  /**
   * Delete user permanently
   * DELETE /api/admin/users/:id
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
