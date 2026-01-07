import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HeroBanner } from '../../components/hero-banner/hero-banner';
import { FeaturedProducts } from '../../components/featured-products/featured-products';
import { SponsoredProducts } from '../../components/sponsored-products/sponsored-products';
import { ProductCardSkeleton } from '../../../../shared/components/skeletons';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'app-home-page',
  imports: [TranslateModule, HeroBanner, FeaturedProducts, SponsoredProducts, ProductCardSkeleton],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit() {
    this.seoService.setSeoData({
      title: 'Home',
      description: 'Welcome to Souq Namasry, the best place to find amazing deals on electronics, fashion, and more. Fast shipping across Egypt.',
      keywords: 'souknamasry, egypt, shopping, deals, electronics',
      image: '/images/hero.webp',
      type: 'website'
    });
  }
}
