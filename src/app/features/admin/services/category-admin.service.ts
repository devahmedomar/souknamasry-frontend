import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  parent?: string | Category;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  image?: string;
  parent?: string;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  image?: string;
  parent?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryAdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}categories`;
  private readonly adminApiUrl = `${environment.apiUrl}admin/categories`;

  /**
   * Get all categories including inactive ones (admin endpoint)
   * GET /api/admin/categories
   */
  getAllCategories(): Observable<{ data: { categories: Category[] } }> {
    return this.http.get<{ data: { categories: Category[] } }>(this.adminApiUrl);
  }

  /**
   * Create a new category
   * POST /api/categories
   */
  createCategory(data: CreateCategoryDto): Observable<{ data: Category }> {
    return this.http.post<{ data: Category }>(this.apiUrl, data);
  }

  /**
   * Update a category
   * PUT /api/categories/:id
   */
  updateCategory(
    id: string,
    data: UpdateCategoryDto
  ): Observable<{ data: Category }> {
    return this.http.put<{ data: Category }>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Activate a category
   * PATCH /api/categories/:id/activate
   */
  activateCategory(id: string): Observable<{ data: Category }> {
    return this.http.patch<{ data: Category }>(
      `${this.apiUrl}/${id}/activate`,
      {}
    );
  }

  /**
   * Deactivate a category
   * PATCH /api/categories/:id/deactivate
   */
  deactivateCategory(id: string): Observable<{ data: Category }> {
    return this.http.patch<{ data: Category }>(
      `${this.apiUrl}/${id}/deactivate`,
      {}
    );
  }

  /**
   * Delete a category
   * DELETE /api/categories/:id
   * Restriction: Can only delete categories with no children or associated products
   */
  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
