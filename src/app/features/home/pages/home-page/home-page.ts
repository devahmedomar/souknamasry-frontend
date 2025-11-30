import { Component } from '@angular/core';
import { HeroBanner } from '../../components/hero-banner/hero-banner';

@Component({
  selector: 'app-home-page',
  imports: [HeroBanner],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {

}
