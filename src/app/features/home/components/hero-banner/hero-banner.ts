import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CarouselModule } from 'primeng/carousel';
import { HeroSlidesService } from '../../services/hero-slides.service';
import { HeroSlide } from '../../../../shared/models/hero-slide.interface';
import { SiteThemeService } from '../../../../core/services/site-theme.service';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgOptimizedImage, CarouselModule],
  templateUrl: './hero-banner.html',
  styleUrl: './hero-banner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBanner {
  private heroSlidesService = inject(HeroSlidesService);
  private translateService = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  protected siteThemeService = inject(SiteThemeService);

  slides = this.heroSlidesService.heroSlides;
  loading = this.heroSlidesService.isLoading;

  // Check if browser for autoplay
  isBrowser = isPlatformBrowser(this.platformId);

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

  // Carousel responsive options
  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 1,
      numScroll: 1,
    },
    {
      breakpoint: '1199px',
      numVisible: 1,
      numScroll: 1,
    },
    {
      breakpoint: '767px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  getTitle(slide: HeroSlide): string {
    const lang = this.currentLang();
    return lang === 'ar' && slide.titleAr ? slide.titleAr : slide.title;
  }

  getSubtitle(slide: HeroSlide): string {
    const lang = this.currentLang();
    return lang === 'ar' && slide.subtitleAr ? slide.subtitleAr : slide.subtitle;
  }

  getCtaText(slide: HeroSlide): string {
    const lang = this.currentLang();
    return lang === 'ar' && slide.ctaTextAr ? slide.ctaTextAr : slide.ctaText;
  }

  getBadgeText(slide: HeroSlide): string | undefined {
    if (!slide.badgeText) return undefined;
    const lang = this.currentLang();
    return lang === 'ar' && slide.badgeTextAr ? slide.badgeTextAr : slide.badgeText;
  }
}
