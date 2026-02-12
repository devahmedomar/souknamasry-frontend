import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { HomepageSectionsService } from '../../services/homepage-sections.service';
import { HomepageSection, HomepageSectionCategory } from '../../../../shared/models/homepage-section.interface';
import { IProductCard } from '../../../../shared/models/productCard';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { ProductCardSkeleton } from '../../../../shared/components/skeletons/product-card-skeleton/product-card-skeleton';
import { CartService } from '../../../cart/services/cart.service';
import { FavouritesService } from '../../../favourites/services/favourites.service';
import { FavouritesStateService } from '../../../favourites/services/favourites-state.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ScrollAnimateDirective } from '../../../../shared/directives/scroll-animate.directive';

/**
 * Component for displaying dynamic homepage sections organized by categories
 * Fetches data from API and displays products using carousel
 */
@Component({
  selector: 'app-dynamic-sections',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    CarouselModule,
    ButtonModule,
    ProductCard,
    ProductCardSkeleton,
    ScrollAnimateDirective
  ],
  templateUrl: './dynamic-sections.component.html',
  styleUrl: './dynamic-sections.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicSectionsComponent implements OnInit {
  private readonly homepageSectionsService = inject(HomepageSectionsService);
  private readonly cartService = inject(CartService);
  private readonly favouritesService = inject(FavouritesService);
  private readonly favouritesState = inject(FavouritesStateService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    // Re-render on language change (OnPush doesn't detect translateService.currentLang changes)
    this.translateService.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  // Input properties
  sortBy = input<'newest' | 'popular' | 'random'>('random');
  limit = input<number>(10);

  // State signals
  sections = signal<HomepageSection[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  favouriteIds = this.favouritesState.productIds;

  // Cache for mapped products to prevent re-rendering
  private productCache = new Map<string, IProductCard[]>();

  // Carousel responsive configuration (matches featured/sponsored products exactly)
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
    this.loadSections();
  }

  /**
   * Load homepage sections from API
   */
  private loadSections(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.homepageSectionsService
      .getHomepageSections({
        sortBy: this.sortBy(),
        limit: this.limit()
      })
      .subscribe({
        next: (sections) => {
          // Clear cache when new sections are loaded
          this.productCache.clear();

          // Pre-cache all section products
          sections.forEach(section => {
            const products = this.homepageSectionsService.mapSectionProducts(section);
            this.productCache.set(section.category._id, products);
          });

          this.sections.set(sections);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading homepage sections:', err);
          this.error.set('Failed to load sections. Please try again later.');
          this.isLoading.set(false);
        }
      });
  }

  /**
   * Get products as product cards for a section (cached)
   */
  getSectionProducts(section: HomepageSection): IProductCard[] {
    // Return cached products to prevent array recreation
    const cached = this.productCache.get(section.category._id);
    if (cached) {
      return cached;
    }

    // Fallback: map and cache
    const products = this.homepageSectionsService.mapSectionProducts(section);
    this.productCache.set(section.category._id, products);
    return products;
  }

  /**
   * Handle add to cart event
   */
  onAddToCart(product: IProductCard): void {
    if (!this.authService.token()) {
      this.toastService.errorT('CART.LOGIN_REQUIRED');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.cartService.addToCart({
      productId: String(product.id),
      quantity: 1
    }).subscribe({
      next: () => {
        this.toastService.successT('CART.ADD_SUCCESS');
      },
      error: (err: any) => {
        console.error('Error adding to cart:', err);
        this.toastService.error(err.error?.message || 'Failed to add product to cart');
      }
    });
  }

  /**
   * Handle add to wishlist event
   */
  onAddToWishlist(product: IProductCard): void {
    if (!this.authService.token()) {
      this.toastService.errorT('WISHLIST.LOGIN_REQUIRED');
      this.router.navigate(['/auth/login']);
      return;
    }

    const productId = product.id.toString();
    const isFav = this.favouriteIds().has(productId);

    if (isFav) {
      this.favouritesService.removeFromFavourites(productId).subscribe({
        next: () => {
          this.toastService.successT('WISHLIST.ITEM_REMOVED');
        },
        error: (err) => {
          console.error('Error removing from wishlist:', err);
          this.toastService.error(err.error?.message || 'Failed to remove from wishlist');
        }
      });
    } else {
      this.favouritesService.addToFavourites(productId).subscribe({
        next: () => {
          this.toastService.successT('WISHLIST.ITEM_ADDED');
        },
        error: (err) => {
          console.error('Error adding to wishlist:', err);
          this.toastService.error(err.error?.message || 'Failed to add to wishlist');
        }
      });
    }
  }

  /**
   * Get localized category name for a section
   */
  getSectionName(category: HomepageSectionCategory): string {
    const lang = this.translateService.currentLang;
    return lang === 'ar' ? (category.nameAr || category.name) : category.name;
  }

  /**
   * Get localized category description for a section
   */
  getSectionDescription(category: HomepageSectionCategory): string | undefined {
    const lang = this.translateService.currentLang;
    if (lang === 'ar') {
      return category.descriptionAr || category.description;
    }
    return category.description;
  }

  /**
   * Track by function for section iteration
   */
  trackBySection(_index: number, section: HomepageSection): string {
    return section.category._id;
  }

  /**
   * Track by function for products in carousel
   */
  trackByProduct(_index: number, product: IProductCard): string | number {
    return product.id;
  }

  /**
   * Reload sections (can be called from parent component)
   */
  reload(): void {
    this.loadSections();
  }
}
