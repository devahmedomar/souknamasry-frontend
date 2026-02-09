import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
declare var gtag: Function;
@Injectable({
  providedIn: 'root',
})
export class Analytics {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object, // للتأكد أننا في المتصفح
  ) {}

  init() {
    // نتحقق أن الكود يعمل في المتصفح فقط وليس على السيرفر
    if (isPlatformBrowser(this.platformId)) {
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          gtag('config', 'G-5XP21EBXT6', {
            page_path: event.urlAfterRedirects,
          });
        });
    }
  }
}
