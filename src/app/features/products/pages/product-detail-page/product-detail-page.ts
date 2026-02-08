import { Component, computed, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal, toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Rating } from 'primeng/rating';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { ProductDetailsService } from '../../services/product-details.service';
import { CategoriesService } from '../../services/categories.service';
import { ProductDetails, BreadcrumbItem, RelatedProduct } from '../../../../shared/models/product.interface';
import { IProductCard } from '../../../../shared/models/productCard';
import { CartService } from '../../../cart/services/cart.service';
import { FavouritesService } from '../../../favourites/services/favourites.service';
import { FavouritesStateService } from '../../../favourites/services/favourites-state.service';
import { AuthService } from '../../../auth/services/auth.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { SocialShare } from '../../../../shared/components/social-share/social-share';
import { ProductDetailSkeleton } from '../../../../shared/components/skeletons';
import { PricePipe } from '../../../../shared/pipes/price.pipe';

@Component({
    selector: 'app-product-detail-page',
    imports: [
        CommonModule,
        RouterLink,
        FormsModule,
        Rating,
        TranslateModule,
        ProductCard,
        SocialShare,
        ProductDetailSkeleton,
        PricePipe
    ],
    templateUrl: './product-detail-page.html',
    styleUrl: './product-detail-page.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private productDetailsService = inject(ProductDetailsService);
    private categoriesService = inject(CategoriesService);
    private cartService = inject(CartService);
    private favouritesService = inject(FavouritesService);
    private favouritesState = inject(FavouritesStateService);
    private authService = inject(AuthService);
    private messageService = inject(MessageService);
    private translateService = inject(TranslateService);
    private seoService = inject(SeoService);
    private cdr = inject(ChangeDetectorRef);

    // Expose favourites state for template
    favouriteIds = this.favouritesState.productIds;

    // Selected options
    selectedSize = signal<string | null>(null);
    selectedColor = signal<string | null>(null);
    quantity = signal(1);
    selectedImageIndex = signal(0);

    // Loading state
    private _loading = signal(true);
    loading = this._loading.asReadonly();

    // Error state
    private _error = signal<string | null>(null);
    error = this._error.asReadonly();

    // Product slug from route
    slug = toSignal(
        this.route.paramMap.pipe(map((params) => params.get('slug') || '')),
        { initialValue: '' }
    );

    // Product data fetched whenever slug changes
    product$ = toObservable(this.slug).pipe(
        tap(() => {
            this._loading.set(true);
            this._error.set(null);
        }),
        switchMap((slug) => {
            if (!slug) {
                this._loading.set(false);
                return of(null);
            }
            return this.productDetailsService.getProductBySlug(slug).pipe(
                tap(() => this._loading.set(false)),
                catchError((err) => {
                    console.error('Error loading product:', err);
                    this._loading.set(false);
                    this._error.set('PRODUCT.NOT_FOUND');
                    return of(null);
                })
            );
        })
    );

    product = toSignal(this.product$);

    // Fetch breadcrumb when product category changes
    breadcrumb$ = toObservable(this.product).pipe(
        switchMap((prod) => {
            if (!prod?.category?._id) return of([]);
            return this.categoriesService.getCategoryBreadcrumb(prod.category._id).pipe(
                map((breadcrumbItems) => {
                    // Build cumulative paths for each breadcrumb item
                    return breadcrumbItems.map((item, i) => {
                        const cumulativePath = breadcrumbItems
                            .slice(0, i + 1)
                            .map(b => b.slug)
                            .join('/');
                        return {
                            ...item,
                            path: cumulativePath
                        } as BreadcrumbItem;
                    });
                }),
                catchError((err) => {
                    console.error('Error loading breadcrumb:', err);
                    return of([]);
                })
            );
        })
    );

    breadcrumb = toSignal(this.breadcrumb$, { initialValue: [] });

    // Computed: Get current displayed image
    currentImage = computed(() => {
        const prod = this.product();
        const index = this.selectedImageIndex();
        if (prod?.images?.length) {
            return prod.images[index] || prod.images[0];
        }
        return 'assets/placeholder.jpg';
    });

    // Computed: Calculate discount percentage
    discountPercentage = computed(() => {
        const prod = this.product();
        if (prod?.compareAtPrice && prod.compareAtPrice > prod.price) {
            return Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100);
        }
        return 0;
    });

    // Computed: Map related products to IProductCard format
    relatedProductCards = computed((): IProductCard[] => {
        const prod = this.product();
        if (!prod?.relatedProducts?.length) return [];

        return prod.relatedProducts.map((rp) => this.mapToProductCard(rp));
    });

    // Computed: Check if product is favourite
    isFavourite = computed(() => {
        const prod = this.product();
        if (!prod) return false;
        return this.favouriteIds().has(prod._id);
    });

    constructor() {
        // Re-render on language change (OnPush doesn't detect translateService.currentLang changes)
        this.translateService.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => {
            this.cdr.markForCheck();
        });

        // SEO effect
        effect(() => {
            const prod = this.product();
            if (prod) {
                const lang = this.translateService.currentLang;
                const name = lang === 'ar' ? (prod.nameAr || prod.name) : prod.name;
                const desc = lang === 'ar' ? (prod.descriptionAr || prod.description) : prod.description;

                this.seoService.setSeoData({
                    title: name,
                    description: desc?.substring(0, 160) || `Shop ${name} at souknamasry`,
                    image: prod.images?.[0],
                    imageAlt: name,
                    url: `https://souknamasry.vercel.app/product/${prod.slug}`,
                    type: 'product',
                    siteName: 'Soukna Masry'
                });

                // JSON-LD Product Schema
                const productSchema = {
                    '@context': 'https://schema.org',
                    '@type': 'Product',
                    name: name,
                    description: desc,
                    image: prod.images,
                    sku: prod.sku,
                    offers: {
                        '@type': 'Offer',
                        price: prod.price,
                        priceCurrency: 'EGP',
                        availability: prod.inStock
                            ? 'https://schema.org/InStock'
                            : 'https://schema.org/OutOfStock'
                    }
                };
                this.seoService.setJsonLd(productSchema);

                // JSON-LD Breadcrumb Schema
                const breadcrumbItems = this.breadcrumb();
                if (breadcrumbItems.length) {
                    const breadcrumbSchema = {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            {
                                '@type': 'ListItem',
                                position: 1,
                                name: 'Categories',
                                item: 'https://souknamasry.vercel.app/categories'
                            },
                            ...breadcrumbItems.map((b, i) => ({
                                '@type': 'ListItem',
                                position: i + 2,
                                name: lang === 'ar' ? (b.nameAr || b.name) : b.name,
                                item: `https://souknamasry.vercel.app/categories/${this.getBreadcrumbPath(i)}`
                            })),
                            {
                                '@type': 'ListItem',
                                position: breadcrumbItems.length + 2,
                                name: name,
                                item: `https://souknamasry.vercel.app/product/${prod.slug}`
                            }
                        ]
                    };
                    this.seoService.setJsonLd(breadcrumbSchema);
                }
            }
        });
    }

    // Get breadcrumb path up to a specific index
    getBreadcrumbPath(index: number): string {
        const items = this.breadcrumb();
        if (!items.length || index >= items.length) return '';
        // Use the path property which contains the full cumulative path
        return items[index].path || items[index].slug;
    }

    // Get breadcrumb router link as array with path as single segment (Angular will encode slashes)
    getBreadcrumbRouterLink(index: number): string[] {
        const path = this.getBreadcrumbPath(index);
        if (!path) return ['/categories'];
        // Return path as single segment - Angular will encode slashes as %2F
        return ['/categories', path];
    }

    // Get localized breadcrumb name
    getBreadcrumbName(item: BreadcrumbItem): string {
        const lang = this.translateService.currentLang;
        return lang === 'ar' ? (item.nameAr || item.name) : item.name;
    }

    // Image selection
    selectImage(index: number): void {
        this.selectedImageIndex.set(index);
    }

    // Size selection
    selectSize(size: string): void {
        this.selectedSize.set(size);
    }

    // Color selection
    selectColor(colorName: string): void {
        this.selectedColor.set(colorName);
    }

    // Quantity management
    incrementQuantity(): void {
        const prod = this.product();
        const maxQty = prod?.stockQuantity || 10;
        if (this.quantity() < maxQty) {
            this.quantity.update((q) => q + 1);
        }
    }

    decrementQuantity(): void {
        if (this.quantity() > 1) {
            this.quantity.update((q) => q - 1);
        }
    }

    // Add to cart
    handleAddToCart(): void {
        const prod = this.product();
        if (!prod) return;

        // Check authentication
        if (!this.authService.token()) {
            this.translateService.get('CART.LOGIN_REQUIRED').subscribe((message: string) => {
                this.messageService.add({
                    severity: 'warn',
                    summary: this.translateService.instant('AUTH.MESSAGES.ERROR'),
                    detail: message,
                    life: 3000
                });
            });
            this.router.navigate(['/auth/login']);
            return;
        }

        // Check if size is required but not selected
        if (prod.sizes?.length && !this.selectedSize()) {
            this.translateService.get('PRODUCT.SELECT_SIZE').subscribe((message: string) => {
                this.messageService.add({
                    severity: 'warn',
                    summary: this.translateService.instant('AUTH.MESSAGES.WARNING'),
                    detail: message,
                    life: 3000
                });
            });
            return;
        }

        // Check if color is required but not selected
        if (prod.colors?.length && !this.selectedColor()) {
            this.translateService.get('PRODUCT.SELECT_COLOR').subscribe((message: string) => {
                this.messageService.add({
                    severity: 'warn',
                    summary: this.translateService.instant('AUTH.MESSAGES.WARNING'),
                    detail: message,
                    life: 3000
                });
            });
            return;
        }

        // Add to cart
        this.cartService
            .addToCart({
                productId: prod._id,
                quantity: this.quantity(),
                size: this.selectedSize() || undefined,
                color: this.selectedColor() || undefined
            })
            .subscribe({
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

    // Toggle favourite
    handleToggleFavourite(): void {
        const prod = this.product();
        if (!prod) return;

        if (!this.authService.token()) {
            this.translateService.get('WISHLIST.LOGIN_REQUIRED').subscribe((message: string) => {
                this.messageService.add({
                    severity: 'warn',
                    summary: this.translateService.instant('AUTH.MESSAGES.ERROR'),
                    detail: message,
                    life: 3000
                });
            });
            this.router.navigate(['/auth/login']);
            return;
        }

        this.favouritesService.toggleFavourite(prod._id).subscribe({
            next: (isNowFavourite) => {
                const messageKey = isNowFavourite
                    ? 'PRODUCT.PRODUCT_ADDED_TO_WISHLIST'
                    : 'PRODUCT.PRODUCT_REMOVED_FROM_WISHLIST';
                this.translateService.get(messageKey).subscribe((message: string) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translateService.instant('AUTH.MESSAGES.SUCCESS'),
                        detail: message,
                        life: 3000
                    });
                });
            },
            error: (err) => {
                console.error('Error toggling favourite:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: this.translateService.instant('AUTH.MESSAGES.ERROR'),
                    detail: err.error?.message || 'Failed to update favourites',
                    life: 3000
                });
            }
        });
    }

    // Handle add to cart from related products
    handleRelatedAddToCart(product: IProductCard): void {
        if (!this.authService.token()) {
            this.translateService.get('CART.LOGIN_REQUIRED').subscribe((message: string) => {
                this.messageService.add({
                    severity: 'warn',
                    summary: this.translateService.instant('AUTH.MESSAGES.ERROR'),
                    detail: message,
                    life: 3000
                });
            });
            this.router.navigate(['/auth/login']);
            return;
        }

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

    // Handle toggle favourite from related products
    handleRelatedToggleFavourite(product: IProductCard): void {
        if (!this.authService.token()) {
            this.translateService.get('WISHLIST.LOGIN_REQUIRED').subscribe((message: string) => {
                this.messageService.add({
                    severity: 'warn',
                    summary: this.translateService.instant('AUTH.MESSAGES.ERROR'),
                    detail: message,
                    life: 3000
                });
            });
            this.router.navigate(['/auth/login']);
            return;
        }

        this.favouritesService.toggleFavourite(product.id.toString()).subscribe({
            next: (isNowFavourite) => {
                const messageKey = isNowFavourite
                    ? 'PRODUCT.PRODUCT_ADDED_TO_WISHLIST'
                    : 'PRODUCT.PRODUCT_REMOVED_FROM_WISHLIST';
                this.translateService.get(messageKey).subscribe((message: string) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translateService.instant('AUTH.MESSAGES.SUCCESS'),
                        detail: message,
                        life: 3000
                    });
                });
            },
            error: (err) => {
                console.error('Error toggling favourite:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: this.translateService.instant('AUTH.MESSAGES.ERROR'),
                    detail: err.error?.message || 'Failed to update favourites',
                    life: 3000
                });
            }
        });
    }

    // Map RelatedProduct to IProductCard
    private mapToProductCard(rp: RelatedProduct): IProductCard {
        const firstImage = rp.images?.[0];
        const imageUrl =
            typeof firstImage === 'string' ? firstImage : 'assets/placeholder.jpg';

        return {
            id: rp._id,
            title: rp.name,
            titleAr: rp.nameAr,
            slug: rp.slug,
            category: '',
            price: rp.price,
            currency: 'جنيها',
            imageUrl: imageUrl,
            rating: 0,
            maxRating: 5
        };
    }

    // Get localized category name
    getCategoryName(): string {
        const prod = this.product();
        if (!prod?.category) return '';
        const lang = this.translateService.currentLang;
        return lang === 'ar' ? (prod.category.nameAr || prod.category.name) : prod.category.name;
    }

    // Get localized product name
    getProductName(): string {
        const prod = this.product();
        if (!prod) return '';
        const lang = this.translateService.currentLang;
        return lang === 'ar' ? (prod.nameAr || prod.name) : prod.name;
    }

    // Get localized product description
    getProductDescription(): string {
        const prod = this.product();
        if (!prod) return '';
        const lang = this.translateService.currentLang;
        return lang === 'ar' ? (prod.descriptionAr || prod.description) : prod.description;
    }
}
