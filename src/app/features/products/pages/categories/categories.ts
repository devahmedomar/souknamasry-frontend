import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { map, switchMap, shareReplay, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';
import { Category } from '../../../../shared/models/category.interface';
import { IProductCard } from '../../../../shared/models/productCard';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, RouterLink, ProductCard],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories {
  private route = inject(ActivatedRoute);
  private categoriesService = inject(CategoriesService);
  private productsService = inject(ProductsService);

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

  // Products data fetched whenever category changes and is a leaf
  products$ = toObservable(this.category).pipe(
    switchMap((cat) => {
      if (cat?.isLeaf) {
        return this.productsService.getProductsByCategory(cat.path).pipe(
          catchError((err) => {
            console.error('Error loading products:', err);
            return of([]);
          })
        );
      }
      return of([]);
    }),
    shareReplay(1)
  );

  products = toSignal(this.products$, { initialValue: [] as IProductCard[] });

  // Refined productsLoading state using a simple computed check against the last emission
  // Note: For complex loading states, we could use a separate signal, 
  // but toSignal with switchMap is generally fast.
  productsLoading = computed(() => {
    const cat = this.category();
    return cat?.isLeaf && this.products() === undefined;
  });

  getBreadcrumbPath(index: number): string {
    const cat = this.category();
    const breadcrumb = (cat as Category | undefined)?.breadcrumb;
    if (!breadcrumb) return '';
    return breadcrumb
      .slice(0, index + 1)
      .map((b) => b.slug)
      .join('/');
  }
}
