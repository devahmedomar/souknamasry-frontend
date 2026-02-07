import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollAnimateDirective } from '../../../../shared/directives/scroll-animate.directive';

interface Testimonial {
  name: string;
  avatar: string;
  ratingStars: number;
  textKey: string;
  roleKey: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, TranslateModule, ScrollAnimateDirective],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Testimonials {
  readonly testimonials: Testimonial[] = [
    {
      name: 'Ahmed Hassan',
      avatar: 'AH',
      ratingStars: 5,
      textKey: 'TESTIMONIALS.REVIEW_1',
      roleKey: 'TESTIMONIALS.ROLE_1',
    },
    {
      name: 'Fatma Ali',
      avatar: 'FA',
      ratingStars: 5,
      textKey: 'TESTIMONIALS.REVIEW_2',
      roleKey: 'TESTIMONIALS.ROLE_2',
    },
    {
      name: 'Mohamed Ibrahim',
      avatar: 'MI',
      ratingStars: 4,
      textKey: 'TESTIMONIALS.REVIEW_3',
      roleKey: 'TESTIMONIALS.ROLE_3',
    },
    {
      name: 'Sara Khaled',
      avatar: 'SK',
      ratingStars: 5,
      textKey: 'TESTIMONIALS.REVIEW_4',
      roleKey: 'TESTIMONIALS.ROLE_4',
    },
  ];

  getStars(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

  getEmptyStars(count: number): number[] {
    return Array.from({ length: 5 - count }, (_, i) => i);
  }
}
