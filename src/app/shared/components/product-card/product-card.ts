import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Rating } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { IProductCard } from '../../models/productCard';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, Rating, FormsModule, ButtonModule, TranslateModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  product = input.required<IProductCard>();

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
