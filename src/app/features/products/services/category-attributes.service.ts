import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FilterDefinitionResponse } from '../../../shared/models/category-attribute.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoryAttributesService {
  private readonly http = inject(HttpClient);

  /**
   * GET /api/category-attributes/:categoryId/filters
   * Returns filterable attribute definitions for a leaf category.
   */
  getFiltersForCategory(categoryId: string): Observable<FilterDefinitionResponse> {
    return this.http.get<FilterDefinitionResponse>(
      `${environment.apiUrl}category-attributes/${categoryId}/filters`
    );
  }
}
