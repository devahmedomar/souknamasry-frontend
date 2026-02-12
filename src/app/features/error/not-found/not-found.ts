import {
  Component,
  ChangeDetectionStrategy,
  inject,
  PLATFORM_ID,
  RESPONSE_INIT,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <h1 class="not-found-code">404</h1>
        <h2 class="not-found-title">{{ 'ERRORS.404_TITLE' | translate }}</h2>
        <p class="not-found-message">{{ 'ERRORS.404_MESSAGE' | translate }}</p>
        <a routerLink="/" class="btn btn-primary not-found-btn">
          {{ 'ERRORS.GO_HOME' | translate }}
        </a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      padding: 2rem;
      text-align: center;
    }
    .not-found-code {
      font-size: 8rem;
      font-weight: 700;
      color: var(--primary-color, #0d6efd);
      line-height: 1;
      margin-bottom: 1rem;
    }
    .not-found-title {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    .not-found-message {
      color: var(--text-muted, #6c757d);
      margin-bottom: 2rem;
    }
    .not-found-btn {
      padding: 0.75rem 2rem;
    }
  `],
})
export class NotFoundPage {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

  constructor() {
    // Return HTTP 404 status code for SSR responses
    if (!isPlatformBrowser(this.platformId) && this.responseInit) {
      this.responseInit.status = 404;
      this.responseInit.statusText = 'Not Found';
    }
  }
}
