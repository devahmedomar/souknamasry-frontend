import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs/operators';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-static-page',
  standalone: true,
  imports: [TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <h1 class="mb-4">{{ titleKey() | translate }}</h1>
          <div class="static-content" [innerHTML]="contentKey() | translate"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .static-content :host ::ng-deep h2 { font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 0.75rem; }
    .static-content :host ::ng-deep p { line-height: 1.8; }
  `],
})
export class StaticPage {
  private route = inject(ActivatedRoute);
  private seoService = inject(SeoService);
  private translateService = inject(TranslateService);

  titleKey = toSignal(
    this.route.data.pipe(map((d) => d['titleKey'] as string)),
    { initialValue: '' }
  );

  contentKey = toSignal(
    this.route.data.pipe(
      switchMap((d) =>
        this.translateService.get(d['titleKey'] as string).pipe(
          map((title: string) => {
            this.seoService.setSeoData({
              title,
              description: d['description'] as string,
              url: `https://souknamasry.vercel.app${d['urlPath'] as string}`,
            });
            return d['contentKey'] as string;
          })
        )
      )
    ),
    { initialValue: '' }
  );
}
