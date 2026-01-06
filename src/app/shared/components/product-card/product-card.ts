import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  product = input.required<IProductCard>();
  isFavourite = input<boolean>(false);

  addToCart = output<IProductCard>();
  addToWishlist = output<IProductCard>();

  onAddToCart(event: Event) {
    event.stopPropagation();
    this.addToCart.emit(this.product());
  }

  onAddToWishlist(event: Event) {
    event.stopPropagation();
    this.addToWishlist.emit(this.product());
  }
}
