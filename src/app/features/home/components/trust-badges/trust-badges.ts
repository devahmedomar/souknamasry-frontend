import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface TrustBadge {
  icon: string;
  titleKey: string;
  descKey: string;
}

@Component({
  selector: 'app-trust-badges',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './trust-badges.html',
  styleUrl: './trust-badges.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrustBadges {
  readonly badges: TrustBadge[] = [
    {
      icon: 'fas fa-shipping-fast',
      titleKey: 'HOMEPAGE.FREE_SHIPPING',
      descKey: 'HOMEPAGE.FREE_SHIPPING_DESC',
    },
    {
      icon: 'fas fa-shield-alt',
      titleKey: 'HOMEPAGE.SECURE_PAYMENT',
      descKey: 'HOMEPAGE.SECURE_PAYMENT_DESC',
    },
    {
      icon: 'fas fa-undo-alt',
      titleKey: 'HOMEPAGE.EASY_RETURNS',
      descKey: 'HOMEPAGE.EASY_RETURNS_DESC',
    },
    {
      icon: 'fas fa-headset',
      titleKey: 'HOMEPAGE.SUPPORT',
      descKey: 'HOMEPAGE.SUPPORT_DESC',
    },
  ];
}
