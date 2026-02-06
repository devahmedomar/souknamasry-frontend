import { Injectable, signal } from '@angular/core';
import { HeroSlide } from '../../../shared/models/hero-slide.interface';

@Injectable({
  providedIn: 'root',
})
export class HeroSlidesService {
  // Mock data - can be replaced with API call later
  private readonly mockSlides: HeroSlide[] = [
    {
      id: '1',
      title: 'SOUKNA MASRY',
      titleAr: 'سوقنا مصري',
      subtitle: 'Behind every order.. support for a small business!',
      subtitleAr: 'وراء كل طلب.. دعم لمشروع صغير!',
      ctaText: 'Browse Now',
      ctaTextAr: 'تصفح الآن',
      ctaLink: '/categories',
      imageUrl: '/images/hero.webp',
      textColor: 'dark',
      priority: 1,
      isActive: true,
    },
    {
      id: '2',
      title: 'New Arrivals',
      titleAr: 'وصل حديثاً',
      subtitle: 'Discover the latest products from Egyptian businesses',
      subtitleAr: 'اكتشف أحدث المنتجات من الشركات المصرية',
      ctaText: 'Shop New',
      ctaTextAr: 'تسوق الجديد',
      ctaLink: '/categories',
      imageUrl: '/images/hero.webp',
      badgeText: 'NEW',
      badgeTextAr: 'جديد',
      textColor: 'dark',
      priority: 2,
      isActive: true,
    },
    {
      id: '3',
      title: 'Special Offers',
      titleAr: 'عروض خاصة',
      subtitle: 'Up to 50% off on selected items',
      subtitleAr: 'خصم يصل إلى 50% على منتجات مختارة',
      ctaText: 'View Deals',
      ctaTextAr: 'شاهد العروض',
      ctaLink: '/categories',
      imageUrl: '/images/hero.webp',
      badgeText: 'SALE',
      badgeTextAr: 'تخفيضات',
      textColor: 'dark',
      priority: 3,
      isActive: true,
    },
  ];

  private slides = signal<HeroSlide[]>([]);
  private loading = signal(false);
  private error = signal<string | null>(null);

  readonly heroSlides = this.slides.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly loadError = this.error.asReadonly();

  constructor() {
    this.loadSlides();
  }

  loadSlides(): void {
    this.loading.set(true);
    this.error.set(null);

    // Simulate API call - replace with actual HTTP call when backend is ready
    setTimeout(() => {
      try {
        const activeSlides = this.mockSlides
          .filter((slide) => slide.isActive)
          .sort((a, b) => a.priority - b.priority);
        this.slides.set(activeSlides);
        this.loading.set(false);
      } catch (e) {
        this.error.set('Failed to load slides');
        this.loading.set(false);
      }
    }, 100);
  }

  // Method to update slides from API when backend is ready
  // fetchSlidesFromApi(): Observable<HeroSlide[]> {
  //   return this.http.get<HeroSlide[]>('/api/hero-slides');
  // }
}
