import { Component, inject, signal, PLATFORM_ID, OnInit } from '@angular/core';
import { SeoService } from './core/services/seo.service';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('ecommerce-souknamasry-frontend-angular21');
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);
  private seoService = inject(SeoService);

  constructor() {
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('ar');
    this.translate.use('ar');

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
      description: 'souknamasry - Your one-stop shop for the best deals in Egypt. Shop electronics, fashion, home essentials, and more.',
      keywords: 'ecommerce, shopping, egypt, online store, electronics, fashion',
      type: 'website',
      image: '/images/hero.webp'
    });
  }
}
