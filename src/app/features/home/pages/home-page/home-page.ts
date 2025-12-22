import { Component } from '@angular/core';
import { HeroBanner } from '../../components/hero-banner/hero-banner';
import { FeaturedProducts } from '../../components/featured-products/featured-products';

@Component({
  selector: 'app-home-page',
  imports: [HeroBanner, FeaturedProducts],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {

}
