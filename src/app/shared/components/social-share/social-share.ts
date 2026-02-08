import { Component, input, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-social-share',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './social-share.html',
  styleUrl: './social-share.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialShare {
  private document = inject(DOCUMENT);
  private messageService = inject(MessageService);
  private translateService = inject(TranslateService);

  productName = input.required<string>();
  productSlug = input.required<string>();
  productImage = input<string>('');

  productUrl = computed(() => {
    const origin = this.document.location.origin;
    return `${origin}/product/${this.productSlug()}`;
  });

  shareWhatsApp(): void {
    const text = encodeURIComponent(`${this.productName()}\n${this.productUrl()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
  }

  shareFacebook(): void {
    const url = encodeURIComponent(this.productUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,width=600,height=400');
  }

  shareTwitter(): void {
    const text = encodeURIComponent(this.productName());
    const url = encodeURIComponent(this.productUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,width=600,height=400');
  }

  shareTelegram(): void {
    const text = encodeURIComponent(this.productName());
    const url = encodeURIComponent(this.productUrl());
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank', 'noopener,width=600,height=400');
  }

  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.productUrl());
      this.showCopiedToast();
    } catch {
      const textarea = this.document.createElement('textarea');
      textarea.value = this.productUrl();
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      this.document.body.appendChild(textarea);
      textarea.select();
      this.document.execCommand('copy');
      this.document.body.removeChild(textarea);
      this.showCopiedToast();
    }
  }

  async nativeShare(): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share({
          title: this.productName(),
          url: this.productUrl()
        });
      } catch {
        // User cancelled share
      }
    }
  }

  get hasNativeShare(): boolean {
    return !!navigator.share;
  }

  private showCopiedToast(): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('AUTH.MESSAGES.SUCCESS'),
      detail: this.translateService.instant('PRODUCT.SHARE_LINK_COPIED'),
      life: 2000
    });
  }
}
