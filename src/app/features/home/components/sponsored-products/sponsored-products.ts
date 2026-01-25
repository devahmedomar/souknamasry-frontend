import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { TranslateModule } from '@ngx-translate/core';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { IProductCard } from '../../../../shared/models/productCard';
import { ProductsService } from '../../../products/services/products.service';
import { CommonModule } from '@angular/common';
import { ProductCardSkeleton } from '../../../../shared/components/skeletons';

@Component({
  selector: 'app-sponsored-products',
  imports: [CarouselModule, TranslateModule, ProductCard, CommonModule, ProductCardSkeleton],
  templateUrl: './sponsored-products.html',
  styleUrl: './sponsored-products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SponsoredProducts implements OnInit {
  private productsService = inject(ProductsService);

  products = signal<IProductCard[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  responsiveOptions = [
    {
      breakpoint: '1199px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '991px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '767px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  ngOnInit(): void {
    this.loadSponsoredProducts();
  }

  loadSponsoredProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productsService.getSponsoredProducts(10).subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading sponsored products:', err);
        this.error.set('Failed to load sponsored products');
        this.loading.set(false);
      }
    });
  }
}
