import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  signal,
  computed,
  OnDestroy,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Rating } from 'primeng/rating';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, map } from 'rxjs';
import { ProductDetailsService } from '../../../features/products/services/product-details.service';
import { ProductDetails } from '../../models/product.interface';
import { CartService } from '../../../features/cart/services/cart.service';
import { FavouritesService } from '../../../features/favourites/services/favourites.service';
import { FavouritesStateService } from '../../../features/favourites/services/favourites-state.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ToastService } from '../../services/toast.service';
import { PricePipe } from '../../pipes/price.pipe';
import { QuickViewService } from '../../services/quick-view.service';

@Component({
  selector: 'app-quick-view-modal',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    FormsModule,
    DialogModule,
    ButtonModule,
    Rating,
    TranslateModule,
    PricePipe,
  ],
  templateUrl: './quick-view-modal.html',
  styleUrl: './quick-view-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickViewModal implements OnDestroy {
  private router = inject(Router);
  private productDetailsService = inject(ProductDetailsService);
  private cartService = inject(CartService);
  private favouritesService = inject(FavouritesService);
  private favouritesState = inject(FavouritesStateService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private translateService = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);
  readonly quickViewService = inject(QuickViewService);

  // Reactive language signal
  private currentLang = toSignal(
    this.translateService.onLangChange.pipe(map(e => e.lang)),
    { initialValue: this.translateService.currentLang }
  );

  // State
  product = signal<ProductDetails | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedImageIndex = signal(0);
  quantity = signal(1);
  selectedSize = signal<string | null>(null);
  selectedColor = signal<string | null>(null);

  private sub?: Subscription;

  // Computed
  visible = this.quickViewService.visible;

  favouriteIds = this.favouritesState.productIds;

  isFavourite = computed(() => {
    const p = this.product();
    if (!p) return false;
    return this.favouriteIds().has(p._id);
  });

  hasDiscount = computed(() => {
    const p = this.product();
    if (!p) return false;
    return !!p.compareAtPrice && p.compareAtPrice > p.price;
  });

  discountPercentage = computed(() => {
    const p = this.product();
    if (!p?.compareAtPrice || p.compareAtPrice <= p.price) return 0;
    return Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100);
  });

  currentImage = computed(() => {
    const p = this.product();
    if (!p || !p.images?.length) return '/images/placeholder.svg';
    return p.images[this.selectedImageIndex()];
  });

  constructor() {
    // Re-render on language change
    this.translateService.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => {
      this.cdr.markForCheck();
    });

    // Subscribe to slug changes
    this.sub = this.quickViewService.slug$.subscribe((slug) => {
      if (slug) {
        this.loadProduct(slug);
      } else {
        this.product.set(null);
      }
    });
  }

  getProductName(): string {
    const p = this.product();
    if (!p) return '';
    const lang = this.currentLang();
    return lang === 'ar' ? (p.nameAr || p.name) : p.name;
  }

  getProductDescription(): string {
    const p = this.product();
    if (!p) return '';
    const lang = this.currentLang();
    return lang === 'ar' ? (p.descriptionAr || p.description) : p.description;
  }

  getCategoryName(): string {
    const p = this.product();
    if (!p?.category) return '';
    const lang = this.currentLang();
    return lang === 'ar' ? (p.category.nameAr || p.category.name) : p.category.name;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private loadProduct(slug: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.selectedImageIndex.set(0);
    this.quantity.set(1);
    this.selectedSize.set(null);
    this.selectedColor.set(null);

    this.productDetailsService.getProductBySlug(slug).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
        // Auto-select first size/color
        if (product.sizes?.length) {
          this.selectedSize.set(product.sizes[0]);
        }
        if (product.colors?.length) {
          this.selectedColor.set(product.colors[0].name);
        }
      },
      error: () => {
        this.error.set('Failed to load product');
        this.loading.set(false);
      },
    });
  }

  onHide(): void {
    this.quickViewService.close();
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  selectSize(size: string): void {
    this.selectedSize.set(size);
  }

  selectColor(color: string): void {
    this.selectedColor.set(color);
  }

  incrementQuantity(): void {
    const p = this.product();
    const max = p?.stockQuantity ?? 99;
    if (this.quantity() < max) {
      this.quantity.update((q) => q + 1);
    }
  }

  decrementQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  addToCart(): void {
    if (!this.authService.token()) {
      this.toast.errorT('CART.LOGIN_REQUIRED');
      this.router.navigate(['/auth/login']);
      this.quickViewService.close();
      return;
    }

    const p = this.product();
    if (!p) return;

    this.cartService
      .addToCart({ productId: p._id, quantity: this.quantity() })
      .subscribe({
        next: () => {
          this.toast.successT('CART.ADD_SUCCESS');
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to add to cart');
        },
      });
  }

  toggleWishlist(): void {
    if (!this.authService.token()) {
      this.toast.errorT('WISHLIST.LOGIN_REQUIRED');
      this.router.navigate(['/auth/login']);
      this.quickViewService.close();
      return;
    }

    const p = this.product();
    if (!p) return;

    if (this.isFavourite()) {
      this.favouritesService.removeFromFavourites(p._id).subscribe({
        next: () => this.toast.successT('WISHLIST.ITEM_REMOVED'),
        error: (err) =>
          this.toast.error(err.error?.message || 'Failed to update wishlist'),
      });
    } else {
      this.favouritesService.addToFavourites(p._id).subscribe({
        next: () => this.toast.successT('WISHLIST.ITEM_ADDED'),
        error: (err) =>
          this.toast.error(err.error?.message || 'Failed to update wishlist'),
      });
    }
  }

  viewFullDetails(): void {
    const p = this.product();
    if (p?.slug) {
      this.quickViewService.close();
      this.router.navigate(['/product', p.slug]);
    }
  }
}
