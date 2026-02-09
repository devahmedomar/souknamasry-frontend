import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IProductCard } from '../../../shared/models/productCard';
import { environment } from '../../../../environments/environment';
import {
    ProductListResponse,
    AutocompleteResponse,
    ProductSearchParams
} from '../../../shared/models/product.interface';

@Injectable({
    providedIn: 'root',
})
export class ProductsService {
    private http = inject(HttpClient);

    getProductsByCategory(path: string, page: number = 1, limit: number = 20): Observable<ProductListResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        return this.http.get<ProductListResponse>(`${environment.apiUrl}products/category/${path}`, { params });
    }

    searchProducts(params: ProductSearchParams): Observable<ProductListResponse> {
        let httpParams = new HttpParams();

        if (params.search) {
            httpParams = httpParams.set('search', params.search);
        }
        if (params.category) {
            if (Array.isArray(params.category)) {
                httpParams = httpParams.set('category', params.category.join(','));
            } else {
                httpParams = httpParams.set('category', params.category);
            }
        }
        if (params.categories && Array.isArray(params.categories)) {
            httpParams = httpParams.set('categories', params.categories.join(','));
        }
        if (params.minPrice !== undefined) {
            httpParams = httpParams.set('minPrice', params.minPrice.toString());
        }
        if (params.maxPrice !== undefined) {
            httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
        }
        if (params.page) {
            httpParams = httpParams.set('page', params.page.toString());
        }
        if (params.limit) {
            httpParams = httpParams.set('limit', params.limit.toString());
        }
        if (params.sort) {
            httpParams = httpParams.set('sort', params.sort);
        }
        if (params.inStock !== undefined) {
            httpParams = httpParams.set('inStock', params.inStock.toString());
        }

        return this.http.get<ProductListResponse>(`${environment.apiUrl}products`, { params: httpParams });
    }

    getAutocompleteSuggestions(
        query: string,
        limit: number = 10,
        categoryId?: string
    ): Observable<AutocompleteResponse> {
        let httpParams = new HttpParams()
            .set('q', query)
            .set('limit', limit.toString());

        if (categoryId) {
            httpParams = httpParams.set('category', categoryId);
        }

        return this.http.get<AutocompleteResponse>(`${environment.apiUrl}products/autocomplete`, {
            params: httpParams
        });
    }

    getFeaturedProducts(limit: number = 10): Observable<IProductCard[]> {
        let httpParams = new HttpParams();

        if (limit < 1 || limit > 20) {
            limit = 10;
        }

        httpParams = httpParams.set('limit', limit.toString());

        return this.http.get<{ status: string; data: { products: any[] } }>(`${environment.apiUrl}products/featured`, { params: httpParams }).pipe(
            map((res) => res.data.products.map(p => this.mapToProductCard(p)))
        );
    }

    getSponsoredProducts(limit: number = 10): Observable<IProductCard[]> {
        let httpParams = new HttpParams();

        if (limit < 1 || limit > 20) {
            limit = 10;
        }

        httpParams = httpParams.set('limit', limit.toString());

        return this.http.get<{ status: string; data: { products: any[] } }>(`${environment.apiUrl}products/sponsored`, { params: httpParams }).pipe(
            map((res) => res.data.products.map(p => this.mapToProductCard(p)))
        );
    }

    public mapToProductCard(p: any): IProductCard {
        const firstImage = p.images?.[0];
        const imageUrl = typeof firstImage === 'string'
            ? firstImage
            : (firstImage?.url || 'assets/placeholder.jpg');

        return {
            id: p._id,
            title: p.name,
            titleAr: p.nameAr,
            slug: p.slug,
            category: p.category?.name || '',
            price: p.price,
            currency: 'جنيها',
            imageUrl: imageUrl,
            rating: p.ratingsAverage || 0,
            maxRating: 5
        };
    }
}
