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
      title: 'الرئيسية',
      description:
        'سوقنا مصري - أفضل موقع تسوق أونلاين في مصر. تسوق الإلكترونيات والموضة ومستلزمات المنزل وأكثر بأفضل الأسعار. شحن سريع لجميع أنحاء مصر.',
      keywords: 'سوقنا مصري, تسوق اونلاين مصر, متجر الكتروني مصر, إلكترونيات, موضة, شحن مصر',
      type: 'website',
      image: '/images/hero.webp',
      lang: 'ar',
    });

    // Global WebSite schema — enables Google Sitelinks Search Box
    this.seoService.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'سوقنا مصري',
      alternateName: 'Soukna Masry',
      url: 'https://souknamasry.vercel.app',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://souknamasry.vercel.app/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    }, 'website');

    // Organization schema — builds brand trust with Google
    this.seoService.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'سوقنا مصري',
      alternateName: 'Soukna Masry',
      url: 'https://souknamasry.vercel.app',
      logo: 'https://souknamasry.vercel.app/images/logo.png',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['Arabic', 'English'],
        areaServed: 'EG',
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'EG',
      },
      sameAs: [
        'https://www.facebook.com/souknamasry',
        'https://www.instagram.com/souknamasry',
        'https://twitter.com/souknamasry',
      ],
    }, 'organization');

    this.analyticsService.init();
  }
}
