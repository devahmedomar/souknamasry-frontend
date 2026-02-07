import { Component, input, output, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Rating } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { IProductCard } from '../../models/productCard';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PricePipe } from '../../pipes/price.pipe';
import { QuickViewService } from '../../services/quick-view.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, Rating, FormsModule, ButtonModule, TranslateModule, PricePipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  private router = inject(Router);
  private quickViewService = inject(QuickViewService);
  private translateService = inject(TranslateService);

  // Reactive language signal — re-evaluates computed signals on language change
  private currentLang = toSignal(
    this.translateService.onLangChange.pipe(map(e => e.lang)),
    { initialValue: this.translateService.currentLang }
  );

  product = input.required<IProductCard>();
  isFavourite = input<boolean>(false);

  addToCart = output<IProductCard>();
  addToWishlist = output<IProductCard>();

  // Computed: Localized product title
  displayTitle = computed(() => {
    const p = this.product();
    const lang = this.currentLang();
    return lang === 'ar' ? (p.titleAr || p.title) : p.title;
  });

  // Computed: Check if product has a valid discount
  hasDiscount = computed(() => {
    const p = this.product();
    return p.compareAtPrice && p.compareAtPrice > p.price;
  });

  // Computed: Calculate discount percentage
  discountPercentage = computed(() => {
    const p = this.product();
    if (!p.compareAtPrice || p.compareAtPrice <= p.price) return 0;
    return Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100);
  });

  // Computed: Check if product is new (created within last 14 days)
  isNewProduct = computed(() => {
    const p = this.product();
    if (p.isNew !== undefined) return p.isNew;
    if (!p.createdAt) return false;
    const createdDate = new Date(p.createdAt);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    return createdDate >= fourteenDaysAgo;
  });

  // Computed: Check if product is out of stock
  isOutOfStock = computed(() => {
    const p = this.product();
    return p.inStock === false;
  });

  // Computed: Check if product has low stock (1-5 items)
  isLowStock = computed(() => {
    const p = this.product();
    return p.stockQuantity !== undefined && p.stockQuantity > 0 && p.stockQuantity <= 5;
  });

  onAddToCart(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.addToCart.emit(this.product());
  }

  onAddToWishlist(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.addToWishlist.emit(this.product());
  }

  onQuickView(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    const prod = this.product();
    if (prod.slug) {
      this.quickViewService.open(prod.slug);
    }
  }

  navigateToProduct() {
    const prod = this.product();
    if (prod.slug) {
      this.router.navigate(['/product', prod.slug]);
    }
  }
}
