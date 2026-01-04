import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HeroBanner } from '../../components/hero-banner/hero-banner';
import { FeaturedProducts } from '../../components/featured-products/featured-products';
import { SponsoredProducts } from '../../components/sponsored-products/sponsored-products';

@Component({
  selector: 'app-home-page',
  imports: [TranslateModule, HeroBanner, FeaturedProducts, SponsoredProducts],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {

}
