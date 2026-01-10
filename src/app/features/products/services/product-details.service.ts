import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProductDetails, ProductDetailsResponse } from '../../../shared/models/product.interface';

@Injectable({
    providedIn: 'root',
})
export class ProductDetailsService {
    private http = inject(HttpClient);

    getProductBySlug(slug: string): Observable<ProductDetails> {
        return this.http
            .get<ProductDetailsResponse>(`${environment.apiUrl}products/slug/${slug}`)
            .pipe(map((res) => res.data));
    }
}
