import { Component } from '@angular/core';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { IProductCard } from '../../../../shared/models/productCard';

@Component({
  selector: 'app-featured-products',
  imports: [ProductCard],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.css',
})
export class FeaturedProducts {
  product: IProductCard = {
    id: 1,
    title: 'فستان مناسبات',
    category: 'هدوم حريمي',
    price: 1000,
    currency: 'جنيها',
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
    rating: 4
  };
}
