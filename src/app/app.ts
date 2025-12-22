import { Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ecommerce-souknamasry-frontend-angular21');
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);

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
}
