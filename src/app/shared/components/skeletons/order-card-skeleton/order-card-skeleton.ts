import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-card-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-card-skeleton.html',
  styleUrl: './order-card-skeleton.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCardSkeleton {
  count = input<number>(1);

  get items(): number[] {
    return Array(this.count()).fill(0);
  }
}
