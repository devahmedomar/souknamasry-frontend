import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    FavouritesResponse,
    FavouriteCheckResponse
} from '../../../shared/models/favourite.interface';
import { FavouritesStateService } from './favourites-state.service';

/**
 * Favourites Service - Handles all favourites-related HTTP requests
 * Follows the same pattern as CartService
 */
@Injectable({
    providedIn: 'root'
})
export class FavouritesService {
    private readonly http = inject(HttpClient);
    private readonly favouritesState = inject(FavouritesStateService);
    private readonly baseUrl = `${environment.apiUrl}favourites`;

    /**
     * Get all user favourites
     */
    getFavourites(): Observable<FavouritesResponse> {
        this.favouritesState.setLoading(true);
        return this.http.get<FavouritesResponse>(this.baseUrl).pipe(
            tap(response => {
                // API returns { status, data: { products: [], count: n } }
                const products = response?.data?.products;
                this.favouritesState.setFavourites(Array.isArray(products) ? products : []);
                this.favouritesState.setLoading(false);
            }),
            catchError(error => {
                this.favouritesState.setLoading(false);
                this.favouritesState.setFavourites([]);
                return this.handleError(error);
            })
        );
    }

    /**
     * Add product to favourites
     * After adding, refetch the full list to get complete product data
     */
    addToFavourites(productId: string): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/${productId}`, {}).pipe(
            switchMap(() => this.getFavourites()),
            catchError(this.handleError)
        );
    }

    /**
     * Check if a single product is in favourites
     */
    checkFavourite(productId: string): Observable<FavouriteCheckResponse> {
        return this.http.get<FavouriteCheckResponse>(`${this.baseUrl}/${productId}/check`).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Remove product from favourites
     */
    removeFromFavourites(productId: string): Observable<{ success: boolean }> {
        return this.http.delete<{ success: boolean }>(`${this.baseUrl}/${productId}`).pipe(
            tap(() => this.favouritesState.removeFavourite(productId)),
            catchError(this.handleError)
        );
    }

    /**
     * Clear all favourites
     */
    clearFavourites(): Observable<{ success: boolean }> {
        return this.http.delete<{ success: boolean }>(this.baseUrl).pipe(
            tap(() => this.favouritesState.clearFavourites()),
            catchError(this.handleError)
        );
    }

    /**
     * Toggle favourite status (add if not exists, remove if exists)
     * Returns true if item is now a favourite, false if removed
     */
    toggleFavourite(productId: string): Observable<boolean> {
        const isFavourite = this.favouritesState.isFavourite(productId);

        if (isFavourite) {
            return this.removeFromFavourites(productId).pipe(
                map(() => false)
            );
        } else {
            return this.addToFavourites(productId).pipe(
                map(() => true)
            );
        }
    }

    /**
     * Handle HTTP errors
     */
    private handleError(error: any): Observable<never> {
        const errorMessage = error.error?.message || error.message || 'An error occurred';
        return throwError(() => error);
    }
}
