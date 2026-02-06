import {
  Component,
  ChangeDetectionStrategy,
  signal,
  ElementRef,
  inject,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface Statistic {
  icon: string;
  value: number;
  suffix?: string;
  labelKey: string;
}

@Component({
  selector: 'app-statistics-counter',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './statistics-counter.html',
  styleUrl: './statistics-counter.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsCounter implements AfterViewInit, OnDestroy {
  private elementRef = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);

  private observer?: IntersectionObserver;
  private hasAnimated = false;

  // Statistics data (mock - can be replaced with API data)
  readonly statistics: Statistic[] = [
    {
      icon: 'fas fa-smile',
      value: 15000,
      suffix: '+',
      labelKey: 'STATISTICS.HAPPY_CUSTOMERS',
    },
    {
      icon: 'fas fa-shopping-bag',
      value: 50000,
      suffix: '+',
      labelKey: 'STATISTICS.PRODUCTS_SOLD',
    },
    {
      icon: 'fas fa-th-large',
      value: 100,
      suffix: '+',
      labelKey: 'STATISTICS.CATEGORIES',
    },
    {
      icon: 'fas fa-award',
      value: 5,
      suffix: '+',
      labelKey: 'STATISTICS.YEARS_EXPERIENCE',
    },
  ];

  // Animated values
  animatedValues = signal<number[]>(this.statistics.map(() => 0));

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupIntersectionObserver();
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupIntersectionObserver(): void {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Skip animation, show final values immediately
      this.animatedValues.set(this.statistics.map((s) => s.value));
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.hasAnimated = true;
            this.animateCounters();
            this.observer?.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  private animateCounters(): void {
    const duration = 2000; // 2 seconds
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);

    let frame = 0;
    const countTo = this.statistics.map((s) => s.value);
    const currentValues = [...this.animatedValues()];

    const counter = setInterval(() => {
      frame++;
      const progress = this.easeOutQuart(frame / totalFrames);

      const newValues = countTo.map((target, index) => {
        return Math.round(currentValues[index] + (target - currentValues[index]) * progress);
      });

      this.animatedValues.set(newValues);

      if (frame === totalFrames) {
        clearInterval(counter);
        // Ensure final values are exact
        this.animatedValues.set(countTo);
      }
    }, frameDuration);
  }

  // Easing function for smooth animation
  private easeOutQuart(x: number): number {
    return 1 - Math.pow(1 - x, 4);
  }

  formatNumber(value: number): string {
    if (value >= 1000) {
      return (value / 1000).toFixed(value >= 10000 ? 0 : 1) + 'K';
    }
    return value.toLocaleString();
  }
}
