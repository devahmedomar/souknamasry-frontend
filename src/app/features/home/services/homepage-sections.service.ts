import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  HomepageSectionsResponse,
  HomepageSection,
  HomepageSectionsParams,
  HomepageSectionProduct
} from '../../../shared/models/homepage-section.interface';
import { IProductCard } from '../../../shared/models/productCard';

/**
 * Service for fetching and managing homepage dynamic sections
 */
@Injectable({
  providedIn: 'root'
})
export class HomepageSectionsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}categories/homepage`;

  /**
   * Fetch homepage sections from API
   * @param params - Query parameters (sortBy, limit)
   * @returns Observable of homepage sections array
   */
  getHomepageSections(params?: HomepageSectionsParams): Observable<HomepageSection[]> {
    let httpParams = new HttpParams();

    if (params?.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }

    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<HomepageSectionsResponse>(this.apiUrl, { params: httpParams }).pipe(
      map(response => response.data.sections)
    );
  }

  /**
   * Convert HomepageSectionProduct to IProductCard format for product-card component
   * @param product - Homepage section product
   * @param categoryName - Category name for display
   * @returns IProductCard object
   */
  mapToProductCard(product: HomepageSectionProduct, categoryName: string): IProductCard {
    return {
      id: product._id,
      title: product.name,
      slug: product.slug,
      category: categoryName,
      price: product.price,
      currency: 'EGP',
      imageUrl: product.images[0] || '/assets/images/placeholder.jpg',
      rating: 0, // API doesn't provide rating, can be enhanced later
      maxRating: 5
    };
  }

  /**
   * Map all products in a section to product cards
   * @param section - Homepage section
   * @returns Array of IProductCard objects
   */
  mapSectionProducts(section: HomepageSection): IProductCard[] {
    return section.products.map(product =>
      this.mapToProductCard(product, section.category.name)
    );
  }
}
