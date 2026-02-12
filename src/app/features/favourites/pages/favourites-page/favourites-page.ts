import { Component, inject, OnInit, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { FavouritesService } from '../../services/favourites.service';
import { FavouritesStateService } from '../../services/favourites-state.service';
import { CartService } from '../../../cart/services/cart.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { ProductCardSkeleton } from '../../../../shared/components/skeletons';
import { IProductCard } from '../../../../shared/models/productCard';
import { Product } from '../../../../shared/models/product.interface';

@Component({
    selector: 'app-favourites-page',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        TranslateModule,
        ProductCard,
        ProductCardSkeleton
    ],
    templateUrl: './favourites-page.html',
    styleUrl: './favourites-page.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavouritesPage implements OnInit {
    private readonly favouritesService = inject(FavouritesService);
    private readonly favouritesState = inject(FavouritesStateService);
    private readonly cartService = inject(CartService);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly toast = inject(ToastService);
    private readonly translateService = inject(TranslateService);
    private readonly messageService = inject(MessageService);

    // State from FavouritesStateService
    favourites = this.favouritesState.favourites;
    loading = this.favouritesState.loading;
    isEmpty = this.favouritesState.isEmpty;
    count = this.favouritesState.count;

    // Transform favourites to product cards
    products = computed(() =>
        this.favourites().map(f => this.mapToProductCard(f))
    );

    // All items are favourites in this view
    favouriteIds = computed(() =>
        new Set(this.favourites().map(f => f._id))
    );

    // Skeleton array for loading state
    skeletonArray = [1, 2, 3, 4, 5, 6];

    ngOnInit(): void {
        // Check if user is authenticated
        if (!this.authService.token()) {
            this.toast.warnT('WISHLIST.LOGIN_REQUIRED', 'COMMON.WARNING');
            this.router.navigate(['/auth/login']);
            return;
        }

        this.loadFavourites();
    }

    loadFavourites(): void {
        this.favouritesService.getFavourites().subscribe({
            error: (err) => {
                console.error('Error loading favourites:', err);
                if (err.status === 401) {
                    this.authService.clearAuthData();
                    this.router.navigate(['/auth/login']);
                }
            }
        });
    }

    handleAddToCart(product: IProductCard): void {
        this.cartService.addToCart({ productId: product.id.toString(), quantity: 1 }).subscribe({
            next: () => {
                this.translateService.get('CART.ADD_SUCCESS').subscribe((message: string) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translateService.instant('AUTH.MESSAGES.SUCCESS'),
                        detail: message,
                        life: 3000
                    });
                });
            },
            error: (err) => {
                console.error('Error adding to cart:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: this.translateService.instant('AUTH.MESSAGES.ERROR'),
                    detail: err.error?.message || 'Failed to add product to cart',
                    life: 3000
                });
            }
        });
    }

    handleToggleFavourite(product: IProductCard): void {
        this.favouritesService.toggleFavourite(product.id.toString()).subscribe({
            next: (isNowFavourite) => {
                if (isNowFavourite) {
                    this.toast.successT('PRODUCT.PRODUCT_ADDED_TO_WISHLIST');
                } else {
                    this.toast.successT('PRODUCT.PRODUCT_REMOVED_FROM_WISHLIST');
                }
            },
            error: (err) => {
                console.error('Error toggling favourite:', err);
                this.toast.errorT('COMMON.ERROR_OCCURRED');
            }
        });
    }

    clearAllFavourites(): void {
        this.favouritesService.clearFavourites().subscribe({
            next: () => {
                this.toast.successT('WISHLIST.CLEARED', 'COMMON.SUCCESS');
            },
            error: (err) => {
                console.error('Error clearing favourites:', err);
                this.toast.errorT('COMMON.ERROR_OCCURRED');
            }
        });
    }

    addAllToCart(): void {
        const products = this.products();
        let successCount = 0;
        let errorCount = 0;

        products.forEach(product => {
            this.cartService.addToCart({ productId: product.id.toString(), quantity: 1 }).subscribe({
                next: () => {
                    successCount++;
                    if (successCount + errorCount === products.length) {
                        this.showBatchResult(successCount, errorCount);
                    }
                },
                error: () => {
                    errorCount++;
                    if (successCount + errorCount === products.length) {
                        this.showBatchResult(successCount, errorCount);
                    }
                }
            });
        });
    }

    private showBatchResult(successCount: number, errorCount: number): void {
        if (errorCount === 0) {
            this.toast.successT('WISHLIST.ADD_ALL_SUCCESS');
        } else if (successCount > 0) {
            this.toast.warnT('WISHLIST.ADD_ALL_PARTIAL');
        } else {
            this.toast.errorT('COMMON.ERROR_OCCURRED');
        }
    }

    private mapToProductCard(product: Product): IProductCard {
        const firstImage = product.images?.[0];
        const imageUrl = typeof firstImage === 'string'
            ? firstImage
            : (product.image || '/images/placeholder.svg');

        return {
            id: product._id,
            title: product.name,
            titleAr: product.nameAr,
            category: product.category || '',
            price: product.price,
            compareAtPrice: product.compareAtPrice ?? undefined,
            currency: 'جنيها',
            imageUrl: imageUrl,
            rating: product.rating || 0,
            maxRating: 5,
            inStock: product.inStock,
            stockQuantity: product.stockQuantity,
            createdAt: product.createdAt ? String(product.createdAt) : undefined,
        };
    }
}
