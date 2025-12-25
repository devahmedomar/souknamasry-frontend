import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IProductCard } from '../../../shared/models/productCard';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ProductsService {
    private http = inject(HttpClient);

    getProductsByCategory(path: string): Observable<IProductCard[]> {
        return this.http.get<{ status: string; data: { products: any[] } }>(`${environment.apiUrl}products/category/${path}`).pipe(
            map((res) => res.data.products.map(p => this.mapToProductCard(p)))
        );
    }

    private mapToProductCard(p: any): IProductCard {
        const firstImage = p.images?.[0];
        const imageUrl = typeof firstImage === 'string'
            ? firstImage
            : (firstImage?.url || 'assets/placeholder.jpg');

        return {
            id: p._id,
            title: p.name,
            category: p.category?.name || '',
            price: p.price,
            currency: 'جنيها', // Assuming EGP for now
            imageUrl: imageUrl,
            rating: p.ratingsAverage || 0,
            maxRating: 5
        };
    }
}
