import { Component, computed, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal, toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, switchMap, shareReplay, catchError, tap, startWith } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';
import { Category } from '../../../../shared/models/category.interface';
import { IProductCard } from '../../../../shared/models/productCard';
import { CartService } from '../../../cart/services/cart.service';
import { FavouritesService } from '../../../favourites/services/favourites.service';
import { FavouritesStateService } from '../../../favourites/services/favourites-state.service';
import { AuthService } from '../../../auth/services/auth.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { ProductCardSkeleton, CategoryCardSkeleton } from '../../../../shared/components/skeletons';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, RouterLink, ProductCard, ProductCardSkeleton, CategoryCardSkeleton],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Categories {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categoriesService = inject(CategoriesService);
  private productsService = inject(ProductsService);
  private cartService = inject(CartService);
  private favouritesService = inject(FavouritesService);
  private favouritesState = inject(FavouritesStateService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private translateService = inject(TranslateService);
  private seoService = inject(SeoService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    // Re-render on language change (OnPush doesn't detect translateService.currentLang changes)
    this.translateService.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => {
      this.cdr.markForCheck();
    });

    effect(() => {
      const cat = this.category();
      if (cat) {
        const lang = this.translateService.currentLang;
        const name = lang === 'ar' ? (cat.nameAr || cat.name) : cat.name;
        const desc = cat.description ? cat.description : `Shop for ${name} at souknamasry. Best prices and fast delivery.`;

        this.seoService.setSeoData({
          title: name,
          description: desc,
          image: cat.image,
          type: 'website'
        });

        // JSON-LD Breadcrumb
        if (cat.breadcrumb) {
          const schema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": cat.breadcrumb.map((b, i) => ({
              "@type": "ListItem",
              "position": i + 1,
              "name": b.name,
              "item": `https://souknamasry.vercel.app/categories/${this.getBreadcrumbPath(i)}`
            }))
          };
          this.seoService.setJsonLd(schema);
        }
      }
    });
  }

  // Expose favourites state for template
  favouriteIds = this.favouritesState.productIds;

  // Path as a signal derived from URL
  path = toSignal(
    this.route.url.pipe(map((segments) => segments.map((s) => s.path).join('/'))),
    { initialValue: '' }
  );

  // Category data fetched whenever path changes
  category$ = toObservable(this.path).pipe(
    switchMap((path) =>
      this.categoriesService.getCategoryByPath(path).pipe(
        catchError((err) => {
          console.error('Error loading category:', err);
          return of(null);
        })
      )
    ),
    shareReplay(1)
  );

  category = toSignal(this.category$);
  loading = computed(() => this.category() === undefined); // toSignal starts with undefined if not provided
  error = computed(() => this.category() === null ? 'Category not found or error loading.' : null);

  // Loading state for products
  private _productsLoading = signal(false);
  productsLoading = this._productsLoading.asReadonly();

  // Products data fetched whenever category changes and is a leaf
  products$ = toObservable(this.category).pipe(
    switchMap((cat) => {
      if (cat?.isLeaf) {
        this._productsLoading.set(true);
        return this.productsService.getProductsByCategory(cat.path).pipe(
          tap(() => this._productsLoading.set(false)),
          catchError((err) => {
            console.error('Error loading products:', err);
            this._productsLoading.set(false);
            return of([]);
          })
        );
      }
      this._productsLoading.set(false);
      return of([]);
    }),
    shareReplay(1)
  );

  products = toSignal(this.products$, { initialValue: [] as IProductCard[] });

  getCategoryName(cat: Category): string {
    const lang = this.translateService.currentLang;
    return lang === 'ar' && cat.nameAr ? cat.nameAr : cat.name;
  }

  getBreadcrumbName(item: { name: string; nameAr?: string }): string {
    const lang = this.translateService.currentLang;
    return lang === 'ar' && item.nameAr ? item.nameAr : item.name;
  }

  getChildName(child: Category): string {
    const lang = this.translateService.currentLang;
    return lang === 'ar' && child.nameAr ? child.nameAr : child.name;
  }

  getBreadcrumbPath(index: number): string {
    const cat = this.category();
    const breadcrumb = (cat as Category | undefined)?.breadcrumb;
    if (!breadcrumb) return '';
    return breadcrumb
      .slice(0, index + 1)
      .map((b) => b.slug)
      .join('/');
  }

  handleAddToCart(product: IProductCard): void {
    // Check if user is authenticated
    if (!this.authService.token()) {
      // Show warning toast
      this.translateService.get('CART.LOGIN_REQUIRED').subscribe((message: string) => {
        this.messageService.add({
          severity: 'warn',
          summary: this.translateService.instant('AUTH.MESSAGES.ERROR'),
          detail: message,
          life: 3000
        });
      });
      // Redirect to login page
      this.router.navigate(['/auth/login']);
      return;
    }

    // User is authenticated, add to cart
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
    // Check if user is authenticated
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

    // Toggle favourite status
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
}
