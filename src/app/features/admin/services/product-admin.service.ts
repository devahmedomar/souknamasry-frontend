import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
  UpdateProductStockDto,
  ToggleProductActiveDto,
  ToggleFeaturedDto,
  ToggleSponsoredDto,
  ProductsResponse,
  ProductResponse,
  ProductQueryParams,
} from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductAdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}admin/products`;

  /**
   * Get all products with pagination and filtering (including inactive)
   * GET /api/admin/products?page=1&limit=20&isActive=true&inStock=true&category=xyz&search=laptop
   */
  getAllProducts(params: ProductQueryParams = {}): Observable<ProductsResponse> {
    let httpParams = new HttpParams();

    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.isActive !== undefined) {
      httpParams = httpParams.set('isActive', params.isActive.toString());
    }
    if (params.inStock !== undefined) {
      httpParams = httpParams.set('inStock', params.inStock.toString());
    }
    if (params.category) {
      httpParams = httpParams.set('category', params.category);
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<ProductsResponse>(this.apiUrl, { params: httpParams });
  }

  /**
   * Get product by ID
   * GET /api/admin/products/:id
   */
  getProductById(id: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new product
   * POST /api/admin/products
   */
  createProduct(data: CreateProductDto): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.apiUrl, data);
  }

  /**
   * Update product
   * PUT /api/admin/products/:id
   */
  updateProduct(id: string, data: UpdateProductDto): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Delete product
   * DELETE /api/admin/products/:id
   */
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update product stock
   * PATCH /api/admin/products/:id/stock
   */
  updateProductStock(
    id: string,
    data: UpdateProductStockDto
  ): Observable<ProductResponse> {
    return this.http.patch<ProductResponse>(`${this.apiUrl}/${id}/stock`, data);
  }

  /**
   * Toggle product active status
   * PATCH /api/admin/products/:id/toggle-active
   */
  toggleProductActive(
    id: string,
    data: ToggleProductActiveDto
  ): Observable<ProductResponse> {
    return this.http.patch<ProductResponse>(
      `${this.apiUrl}/${id}/toggle-active`,
      data
    );
  }

  /**
   * Toggle product featured status
   * PATCH /api/admin/products/:id/featured
   */
  toggleFeatured(
    id: string,
    data: ToggleFeaturedDto
  ): Observable<ProductResponse> {
    return this.http.patch<ProductResponse>(
      `${this.apiUrl}/${id}/featured`,
      data
    );
  }

  /**
   * Toggle product sponsored status
   * PATCH /api/admin/products/:id/sponsored
   */
  toggleSponsored(
    id: string,
    data: ToggleSponsoredDto
  ): Observable<ProductResponse> {
    return this.http.patch<ProductResponse>(
      `${this.apiUrl}/${id}/sponsored`,
      data
    );
  }
}
