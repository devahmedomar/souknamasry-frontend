import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { IProductCard } from '../../../../shared/models/productCard';
import { CarouselModule } from 'primeng/carousel';
import { ProductsService } from '../../../products/services/products.service';
import { CommonModule } from '@angular/common';
import { ProductCardSkeleton } from '../../../../shared/components/skeletons';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-featured-products',
  imports: [ProductCard, CarouselModule, CommonModule, ProductCardSkeleton, TranslateModule],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedProducts implements OnInit {
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
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productsService.getFeaturedProducts(10).subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading featured products:', err);
        this.error.set('HOMEPAGE.ERROR_LOADING_FEATURED');
        this.loading.set(false);
      }
    });
  }
}
