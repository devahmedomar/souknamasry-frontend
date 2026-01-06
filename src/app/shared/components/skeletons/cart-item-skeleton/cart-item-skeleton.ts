import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-item-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-item-skeleton.html',
  styleUrl: './cart-item-skeleton.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartItemSkeleton {
  count = input<number>(1);
  compact = input<boolean>(false);

  get items(): number[] {
    return Array(this.count()).fill(0);
  }
}
