import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card-skeleton.html',
  styleUrl: './product-card-skeleton.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardSkeleton {
  count = input<number>(1);

  get items(): number[] {
    return Array(this.count()).fill(0);
  }
}
