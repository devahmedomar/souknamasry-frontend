import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { IProductCard } from '../../../../shared/models/productCard';
import { CarouselModule } from 'primeng/carousel';
import { ProductsService } from '../../../products/services/products.service';
import { CommonModule } from '@angular/common';
import { ProductCardSkeleton } from '../../../../shared/components/skeletons';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../../cart/services/cart.service';
import { FavouritesService } from '../../../favourites/services/favourites.service';
import { FavouritesStateService } from '../../../favourites/services/favourites-state.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-featured-products',
  imports: [ProductCard, CarouselModule, CommonModule, ProductCardSkeleton, TranslateModule],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedProducts implements OnInit {
  private productsService = inject(ProductsService);
  private cartService = inject(CartService);
  private favouritesService = inject(FavouritesService);
  private favouritesState = inject(FavouritesStateService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  products = signal<IProductCard[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  favouriteIds = this.favouritesState.productIds;

  responsiveOptions = [
    {
      breakpoint: '1199px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '991px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '767px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productsService.getFeaturedProducts(10).subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading featured products:', err);
        this.error.set('HOMEPAGE.ERROR_LOADING_FEATURED');
        this.loading.set(false);
      }
    });
  }

  onAddToCart(product: IProductCard): void {
    if (!this.authService.token()) {
      this.toast.errorT('CART.LOGIN_REQUIRED');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.cartService.addToCart({
      productId: String(product.id),
      quantity: 1
    }).subscribe({
      next: () => {
        this.toast.successT('CART.ADD_SUCCESS');
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        this.toast.error(err.error?.message || 'Failed to add to cart');
      }
    });
  }

  onAddToWishlist(product: IProductCard): void {
    if (!this.authService.token()) {
      this.toast.errorT('WISHLIST.LOGIN_REQUIRED');
      this.router.navigate(['/auth/login']);
      return;
    }

    const productId = product.id.toString();
    const isFav = this.favouriteIds().has(productId);

    if (isFav) {
      this.favouritesService.removeFromFavourites(productId).subscribe({
        next: () => {
          this.toast.successT('WISHLIST.ITEM_REMOVED');
        },
        error: (err) => {
          console.error('Error removing from wishlist:', err);
          this.toast.error(err.error?.message || 'Failed to remove from wishlist');
        }
      });
    } else {
      this.favouritesService.addToFavourites(productId).subscribe({
        next: () => {
          this.toast.successT('WISHLIST.ITEM_ADDED');
        },
        error: (err) => {
          console.error('Error adding to wishlist:', err);
          this.toast.error(err.error?.message || 'Failed to add to wishlist');
        }
      });
    }
  }
}
