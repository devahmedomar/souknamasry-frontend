import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Rating } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { IProductCard } from '../../models/productCard';
import { TranslateModule } from '@ngx-translate/core';
import { PricePipe } from '../../pipes/price.pipe';

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

  product = input.required<IProductCard>();
  isFavourite = input<boolean>(false);

  addToCart = output<IProductCard>();
  addToWishlist = output<IProductCard>();

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

  navigateToProduct() {
    const prod = this.product();
    if (prod.slug) {
      this.router.navigate(['/product', prod.slug]);
    }
  }
}
