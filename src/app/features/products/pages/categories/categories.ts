import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { map, switchMap, shareReplay, catchError, tap, startWith } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';
import { Category } from '../../../../shared/models/category.interface';
import { IProductCard } from '../../../../shared/models/productCard';
import { CartService } from '../../../cart/services/cart.service';
import { AuthService } from '../../../auth/services/auth.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { ProductCardSkeleton, CategoryCardSkeleton } from '../../../../shared/components/skeletons';

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
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private translateService = inject(TranslateService);

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
}
