import { Component, OnInit, signal, inject, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { IProductCard } from '../../../../shared/models/productCard';
import { CartService } from '../../../cart/services/cart.service';
import { FavouritesService } from '../../../favourites/services/favourites.service';
import { FavouritesStateService } from '../../../favourites/services/favourites-state.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-search-results-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, ProductCard],
  templateUrl: './search-results-page.html',
  styleUrls: ['./search-results-page.css']
})
export class SearchResultsPage implements OnInit {
  private productsService = inject(ProductsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private cartService = inject(CartService);
  private favouritesService = inject(FavouritesService);
  private favouritesState = inject(FavouritesStateService);
  private toast = inject(ToastService);
  private authService = inject(AuthService);

  searchQuery = signal<string>('');
  products = signal<IProductCard[]>([]);
  loading = signal<boolean>(false);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalResults = signal<number>(0);
  selectedSort = signal<string>('relevance');

  sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'featured', label: 'Featured' }
  ];

  hasResults = computed(() => this.products().length > 0);
  showNoResults = computed(() => !this.loading() && !this.hasResults() && this.searchQuery() !== '');

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const query = params['q'] || '';
        const page = parseInt(params['page']) || 1;
        const sort = params['sort'] || 'relevance';

        this.searchQuery.set(query);
        this.currentPage.set(page);
        this.selectedSort.set(sort);

        if (query) {
          this.performSearch();
        }
      });
  }

  performSearch(): void {
    const query = this.searchQuery();
    if (!query) return;

    this.loading.set(true);

    this.productsService
      .searchProducts({
        search: query,
        sort: this.selectedSort() as any,
        page: this.currentPage(),
        limit: 20
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          // Map ProductDetails to IProductCard
          const mappedProducts = response.data.products.map(p => this.mapToProductCard(p));
          this.products.set(mappedProducts);
          this.totalResults.set(response.data.pagination.total);
          this.totalPages.set(response.data.pagination.pages);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Search error:', error);
          this.loading.set(false);
          this.products.set([]);
        }
      });
  }

  private mapToProductCard(product: any): IProductCard {
    const firstImage = product.images?.[0];
    const imageUrl = typeof firstImage === 'string'
      ? firstImage
      : (firstImage?.url || '/images/placeholder.svg');

    return {
      id: product._id,
      title: product.name,
      slug: product.slug,
      category: product.category?.name || '',
      price: product.price,
      currency: 'جنيها',
      imageUrl: imageUrl,
      rating: product.rating || 0,
      maxRating: 5
    };
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedSort.set(select.value);
    this.currentPage.set(1);
    this.updateQueryParams();
    this.performSearch();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.updateQueryParams();
    this.performSearch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchQuery(),
        page: this.currentPage(),
        sort: this.selectedSort()
      },
      queryParamsHandling: 'merge'
    });
  }

  onAddToCart(product: IProductCard): void {
    if (!this.authService.token()) {
      this.toast.errorT('CART.LOGIN_REQUIRED');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.cartService.addToCart({
      productId: product.id.toString(),
      quantity: 1
    }).subscribe({
      next: () => {
        this.toast.successT('CART.ADD_SUCCESS');
      },
      error: (error) => {
        console.error('Add to cart error:', error);
        this.toast.errorT('COMMON.ERROR_OCCURRED');
      }
    });
  }

  onAddToWishlist(product: IProductCard): void {
    if (!this.authService.token()) {
      this.toast.errorT('WISHLIST.LOGIN_REQUIRED');
      this.router.navigate(['/auth/login']);
      return;
    }

    const isFavourite = this.isFavourite(product.id.toString());

    if (isFavourite) {
      // Remove from favourites
      this.favouritesService.removeFromFavourites(product.id.toString()).subscribe({
        next: () => {
          this.toast.successT('WISHLIST.ITEM_REMOVED');
        },
        error: (error: any) => {
          console.error('Remove from favourites error:', error);
          this.toast.errorT('COMMON.ERROR_OCCURRED');
        }
      });
    } else {
      // Add to favourites
      this.favouritesService.addToFavourites(product.id.toString()).subscribe({
        next: () => {
          this.toast.successT('WISHLIST.ITEM_ADDED');
        },
        error: (error: any) => {
          console.error('Add to favourites error:', error);
          this.toast.errorT('COMMON.ERROR_OCCURRED');
        }
      });
    }
  }

  isFavourite(productId: string): boolean {
    const productIdsSet = this.favouritesState.productIds();
    return productIdsSet.has(productId);
  }
}
