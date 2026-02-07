import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, signal, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CategoriesService } from '../../../products/services/categories.service';
import { Category } from '../../../../shared/models/category.interface';
import { ScrollAnimateDirective } from '../../../../shared/directives/scroll-animate.directive';

@Component({
  selector: 'app-category-showcase',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgOptimizedImage, ScrollAnimateDirective],
  templateUrl: './category-showcase.html',
  styleUrl: './category-showcase.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryShowcase implements OnInit {
  private categoriesService = inject(CategoriesService);
  private translateService = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Reactive language signal
  currentLang = toSignal(
    this.translateService.onLangChange.pipe(map(e => e.lang)),
    { initialValue: this.translateService.currentLang || 'en' }
  );

  constructor() {
    this.translateService.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  // Maximum categories to display
  readonly maxCategories = 8;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.error.set(null);

    this.categoriesService.getCategoryByPath('').subscribe({
      next: (rootCategory) => {
        const children = rootCategory.children || [];
        // Take first 8 categories with images
        const topCategories = children
          .filter((cat) => cat.image)
          .slice(0, this.maxCategories);

        // If not enough categories with images, add some without
        if (topCategories.length < this.maxCategories) {
          const remaining = children
            .filter((cat) => !cat.image)
            .slice(0, this.maxCategories - topCategories.length);
          topCategories.push(...remaining);
        }

        this.categories.set(topCategories);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.error.set('Failed to load categories');
        this.loading.set(false);
      },
    });
  }

  getCategoryName(category: Category): string {
    const lang = this.currentLang();
    return lang === 'ar' && category.nameAr ? category.nameAr : category.name;
  }

  getCategoryLink(category: Category): string {
    return `/categories/${category.path || category.slug}`;
  }

  getPlaceholderIcon(category: Category): string {
    // Return a default icon based on category name
    const iconMap: { [key: string]: string } = {
      electronics: 'fas fa-laptop',
      clothes: 'fas fa-tshirt',
      fashion: 'fas fa-tshirt',
      home: 'fas fa-home',
      housewares: 'fas fa-couch',
      beauty: 'fas fa-spa',
      makeup: 'fas fa-magic',
      sports: 'fas fa-futbol',
      toys: 'fas fa-gamepad',
      books: 'fas fa-book',
      furniture: 'fas fa-chair',
      shoes: 'fas fa-shoe-prints',
      accessories: 'fas fa-gem',
      jewelry: 'fas fa-ring',
      bags: 'fas fa-shopping-bag',
      watches: 'fas fa-clock',
    };

    const slug = category.slug.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (slug.includes(key)) {
        return icon;
      }
    }
    return 'fas fa-box';
  }
}
