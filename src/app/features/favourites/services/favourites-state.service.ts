import { Injectable, signal, computed } from '@angular/core';
import { FavouriteProduct } from '../../../shared/models/favourite.interface';

/**
 * Favourites State Service - Manages favourites state using Angular signals
 * Follows the same pattern as CartStateService
 */
@Injectable({
    providedIn: 'root'
})
export class FavouritesStateService {
    // Private signals for state
    private _favourites = signal<FavouriteProduct[]>([]);
    private _loading = signal(false);
    private _error = signal<string | null>(null);

    // Public readonly signals
    readonly favourites = this._favourites.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    // Computed values
    readonly count = computed(() => {
        const favourites = this._favourites();
        return Array.isArray(favourites) ? favourites.length : 0;
    });

    readonly isEmpty = computed(() => {
        const favourites = this._favourites();
        return !Array.isArray(favourites) || favourites.length === 0;
    });

    readonly productIds = computed(() => {
        const favourites = this._favourites();
        if (!Array.isArray(favourites)) return new Set<string>();
        return new Set(favourites.map(f => f._id).filter(Boolean));
    });

    // State mutations
    setFavourites(favourites: FavouriteProduct[]): void {
        this._favourites.set(Array.isArray(favourites) ? favourites : []);
        this._error.set(null);
    }

    addFavourite(item: FavouriteProduct): void {
        this._favourites.update(favourites => [...favourites, item]);
    }

    removeFavourite(productId: string): void {
        this._favourites.update(favourites =>
            favourites.filter(f => f._id !== productId)
        );
    }

    setLoading(loading: boolean): void {
        this._loading.set(loading);
    }

    setError(error: string | null): void {
        this._error.set(error);
    }

    clearFavourites(): void {
        this._favourites.set([]);
    }

    reset(): void {
        this._favourites.set([]);
        this._loading.set(false);
        this._error.set(null);
    }

    /**
     * Check if a product is in favourites (synchronous, uses local state)
     */
    isFavourite(productId: string): boolean {
        const ids = this.productIds();
        return ids.has(productId);
    }
}
