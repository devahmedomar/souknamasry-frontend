import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
  input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { HomepageSectionsService } from '../../services/homepage-sections.service';
import { HomepageSection } from '../../../../shared/models/homepage-section.interface';
import { IProductCard } from '../../../../shared/models/productCard';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { ProductCardSkeleton } from '../../../../shared/components/skeletons/product-card-skeleton/product-card-skeleton';
import { CartService } from '../../../cart/services/cart.service';
import { ToastService } from '../../../../shared/services/toast.service';

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
    ProductCardSkeleton
  ],
  templateUrl: './dynamic-sections.component.html',
  styleUrl: './dynamic-sections.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicSectionsComponent implements OnInit {
  private readonly homepageSectionsService = inject(HomepageSectionsService);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);

  // Input properties
  sortBy = input<'newest' | 'popular'>('newest');
  limit = input<number>(10);

  // State signals
  sections = signal<HomepageSection[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

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
    this.cartService.addToCart({
      productId: String(product.id),
      quantity: 1
    }).subscribe({
      next: () => {
        this.toastService.success('Product added to cart successfully');
      },
      error: (err: any) => {
        console.error('Error adding to cart:', err);
        this.toastService.error('Failed to add product to cart');
      }
    });
  }

  /**
   * Handle add to wishlist event
   */
  onAddToWishlist(_product: IProductCard): void {
    // Wishlist functionality can be implemented here
    this.toastService.info('Wishlist feature coming soon!');
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
