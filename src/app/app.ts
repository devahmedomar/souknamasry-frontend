import { Component, inject, signal, PLATFORM_ID, OnInit } from '@angular/core';
import { SeoService } from './core/services/seo.service';
import { ThemeService } from './core/services/theme.service';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { Toast } from 'primeng/toast';
import { Carousel } from 'primeng/carousel';
import { QuickViewModal } from './shared/components/quick-view-modal/quick-view-modal';
import { Analytics } from './shared/services/analytics';

// Fix: PrimeNG Carousel blocks vertical page scrolling on mobile.
// onTouchMove only calls preventDefault() — the swipe logic is in onTouchEnd,
// so making this a no-op restores scrolling without breaking horizontal swipe.
Carousel.prototype.onTouchMove = function () {};

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, QuickViewModal],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('ecommerce-souknamasry-frontend-angular21');
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);
  private seoService = inject(SeoService);
  private themeService = inject(ThemeService);
  private analyticsService = inject(Analytics);

  constructor() {
    // Initialize theme before language setup to prevent FOUC
    this.themeService.initializeTheme();
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('ar');

    // Load saved language from localStorage or default to 'ar'
    let savedLang = 'ar';
    if (isPlatformBrowser(this.platformId)) {
      savedLang = localStorage.getItem('lang') || 'ar';
    }
    this.translate.use(savedLang);

    this.translate.onLangChange.subscribe((event) => {
      if (isPlatformBrowser(this.platformId)) {
        const dir = event.lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = event.lang;
      }
    });
  }

  ngOnInit() {
    this.seoService.setSeoData({
      title: 'Home',
      description:
        'souknamasry - Your one-stop shop for the best deals in Egypt. Shop electronics, fashion, home essentials, and more.',
      keywords: 'ecommerce, shopping, egypt, online store, electronics, fashion',
      type: 'website',
      image: '/images/hero.webp',
    });
    this.analyticsService.init();
  }
}
