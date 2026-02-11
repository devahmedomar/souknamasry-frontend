import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CategoryAttribute,
  CategoryAttributeResponse,
} from '../../../shared/models/category-attribute.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoryAttributesAdminService {
  private readonly http = inject(HttpClient);
  private readonly adminApiUrl = `${environment.apiUrl}admin/category-attributes`;

  /**
   * GET /api/admin/category-attributes/:categoryId
   */
  getAttributesForCategory(categoryId: string): Observable<CategoryAttributeResponse> {
    return this.http.get<CategoryAttributeResponse>(
      `${this.adminApiUrl}/${categoryId}`
    );
  }

  /**
   * PUT /api/admin/category-attributes/:categoryId
   */
  saveAttributesForCategory(
    categoryId: string,
    attributes: CategoryAttribute[]
  ): Observable<CategoryAttributeResponse> {
    return this.http.put<CategoryAttributeResponse>(
      `${this.adminApiUrl}/${categoryId}`,
      { attributes }
    );
  }

  /**
   * DELETE /api/admin/category-attributes/:categoryId
   */
  deleteAttributesForCategory(categoryId: string): Observable<void> {
    return this.http.delete<void>(`${this.adminApiUrl}/${categoryId}`);
  }
}
