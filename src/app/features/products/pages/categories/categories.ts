import { Component, computed, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal, toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, switchMap, shareReplay, catchError, tap } from 'rxjs/operators';
import { of, combineLatest } from 'rxjs';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';
import { CategoryAttributesService } from '../../services/category-attributes.service';
import { Category } from '../../../../shared/models/category.interface';
import { IProductCard } from '../../../../shared/models/productCard';
import { CartService } from '../../../cart/services/cart.service';
import { FavouritesService } from '../../../favourites/services/favourites.service';
import { FavouritesStateService } from '../../../favourites/services/favourites-state.service';
import { AuthService } from '../../../auth/services/auth.service';
import { MessageService } from 'primeng/api';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ProductCardSkeleton, CategoryCardSkeleton } from '../../../../shared/components/skeletons';
import { SeoService } from '../../../../core/services/seo.service';
import { FilterSidebar } from '../../components/filter-sidebar/filter-sidebar';
import { SiteThemeService } from '../../../../core/services/site-theme.service';
import {
  CategoryAttribute,
  ActiveFilters,
  AttrFilterValue,
} from '../../../../shared/models/category-attribute.interface';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, RouterLink, TranslateModule, ProductCard, ProductCardSkeleton, CategoryCardSkeleton, FilterSidebar],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Categories {
  protected siteThemeService = inject(SiteThemeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categoriesService = inject(CategoriesService);
  private productsService = inject(ProductsService);
  private categoryAttributesService = inject(CategoryAttributesService);
  private cartService = inject(CartService);
  private favouritesService = inject(FavouritesService);
  private favouritesState = inject(FavouritesStateService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private translateService = inject(TranslateService);
  private seoService = inject(SeoService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

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
          url: `https://souknamasry.vercel.app/categories/${this.path()}`,
          type: 'website',
          lang: lang === 'ar' ? 'ar' : 'en',
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

    // ItemList schema — enables Google rich results on category pages
    effect(() => {
      const prods = this.products();
      const cat = this.category();
      if (!cat || !prods.length) return;

      const lang = this.translateService.currentLang;
      const itemList = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: lang === 'ar' ? (cat.nameAr || cat.name) : cat.name,
        url: `https://souknamasry.vercel.app/categories/${this.path()}`,
        numberOfItems: prods.length,
        itemListElement: prods.slice(0, 10).map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `https://souknamasry.vercel.app/product/${p.slug || p.id}`,
          name: p.title,
        })),
      };
      this.seoService.setJsonLd(itemList, 'itemlist');
    });

    // Load filter definitions when a leaf category is active
    toObservable(this.category).pipe(
      takeUntilDestroyed(),
      switchMap((cat) => {
        this._filterAttributes.set([]);
        // Only reset filters if they're non-empty — avoids a spurious combineLatest
        // emission that would cancel and duplicate the products request on initial load
        if (Object.keys(this.activeFilters()).length > 0) {
          this.activeFilters.set({});
        }
        if (!cat?.isLeaf || !cat._id) return of(null);
        this._filtersLoading.set(true);
        return this.categoryAttributesService.getFiltersForCategory(cat._id).pipe(
          tap((res) => {
            const filterable = (res.data.filters ?? []).filter((a) => a.filterable);
            this._filterAttributes.set(filterable);
            this._filtersLoading.set(false);
            this.cdr.markForCheck();
          }),
          catchError(() => {
            this._filterAttributes.set([]);
            this._filtersLoading.set(false);
            return of(null);
          })
        );
      })
    ).subscribe();
  }

  // Expose favourites state for template
  favouriteIds = this.favouritesState.productIds;

  // Pagination signals
  currentPage = signal(1);
  pageSize = signal(20);
  totalResults = signal(0);
  totalPages = signal(0);

  // Filter state
  activeFilters = signal<ActiveFilters>({});

  // Attribute definitions for current leaf category
  private _filterAttributes = signal<CategoryAttribute[]>([]);
  filterAttributes = this._filterAttributes.asReadonly();
  private _filtersLoading = signal(false);
  filtersLoading = this._filtersLoading.asReadonly();

  // Path as a signal derived from URL
  path = toSignal(
    this.route.url.pipe(
      map((segments) => segments.map((s) => s.path).join('/')),
      tap(() => this.currentPage.set(1))
    ),
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
  loading = computed(() => this.category() === undefined);
  error = computed(() => this.category() === null ? 'Category not found or error loading.' : null);

  // Loading state for products
  private _productsLoading = signal(false);
  productsLoading = this._productsLoading.asReadonly();

  // Products data fetched whenever category, page, or filters change
  products$ = combineLatest([
    toObservable(this.category),
    toObservable(this.currentPage),
    toObservable(this.activeFilters),
  ]).pipe(
    switchMap(([cat, page, filters]) => {
      if (cat?.isLeaf) {
        this._productsLoading.set(true);
        const hasFilters = Object.keys(filters).length > 0;

        if (hasFilters) {
          return this.productsService.searchProducts({
            category: cat._id,
            page,
            limit: this.pageSize(),
            attrs: this.serializeFiltersForApi(filters),
          }).pipe(
            tap((res) => {
              this.totalResults.set(res.data.pagination.total);
              this.totalPages.set(res.data.pagination.pages);
              this._productsLoading.set(false);
            }),
            map((res) => res.data.products.map((p) => this.productsService.mapToProductCard(p))),
            catchError((err) => {
              console.error('Error loading filtered products:', err);
              this._productsLoading.set(false);
              return of([]);
            })
          );
        }

        return this.productsService.getProductsByCategory(cat.path, page, this.pageSize()).pipe(
          tap((res) => {
            this.totalResults.set(res.data.pagination.total);
            this.totalPages.set(res.data.pagination.pages);
            this._productsLoading.set(false);
          }),
          map((res) => res.data.products.map((p) => this.productsService.mapToProductCard(p))),
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

  handleFiltersChanged(filters: ActiveFilters): void {
    this.currentPage.set(1);
    this.activeFilters.set(filters);
  }

  handlePageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  private serializeFiltersForApi(
    filters: ActiveFilters
  ): Record<string, string | { min?: number; max?: number }> {
    const result: Record<string, string | { min?: number; max?: number }> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (Array.isArray(value)) {
        result[key] = value.join(',');
      } else if (typeof value === 'string') {
        result[key] = value;
      } else {
        result[key] = value as { min?: number; max?: number };
      }
    }
    return result;
  }

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

  handleToggleFavourite(product: IProductCard): void {
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
}
