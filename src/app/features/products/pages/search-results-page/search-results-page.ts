import { Component, OnInit, signal, inject, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { ProductDetails } from '../../../../shared/models/product.interface';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-results-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './search-results-page.html',
  styleUrls: ['./search-results-page.css']
})
export class SearchResultsPage implements OnInit {
  private productsService = inject(ProductsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  searchQuery = signal<string>('');
  products = signal<ProductDetails[]>([]);
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
          this.products.set(response.data.products);
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

  viewProduct(slug: string): void {
    this.router.navigate(['/product', slug]);
  }

  getDiscountPercentage(product: ProductDetails): number {
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
    }
    return 0;
  }
}
