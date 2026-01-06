import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-address-card-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './address-card-skeleton.html',
  styleUrl: './address-card-skeleton.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressCardSkeleton {
  count = input<number>(1);

  get items(): number[] {
    return Array(this.count()).fill(0);
  }
}
