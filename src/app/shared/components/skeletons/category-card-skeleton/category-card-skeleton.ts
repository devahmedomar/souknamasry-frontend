import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-card-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-card-skeleton.html',
  styleUrl: './category-card-skeleton.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryCardSkeleton {
  count = input<number>(1);

  get items(): number[] {
    return Array(this.count()).fill(0);
  }
}
