import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare const grecaptcha: any;

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {
  private readonly siteKey = '6LeZ-1osAAAAAJvUwRotcofDMRZiB2XJMFxRtWxa';
  private platformId = inject(PLATFORM_ID);

  execute(action: string): Promise<string> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve('');
    }

    return new Promise((resolve, reject) => {
      if (typeof grecaptcha === 'undefined') {
        reject(new Error('reCAPTCHA not loaded'));
        return;
      }

      grecaptcha.ready(() => {
        grecaptcha.execute(this.siteKey, { action })
          .then((token: string) => resolve(token))
          .catch((error: any) => reject(error));
      });
    });
  }
}
