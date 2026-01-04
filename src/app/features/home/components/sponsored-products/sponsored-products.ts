import { Component } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { TranslateModule } from '@ngx-translate/core';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { IProductCard } from '../../../../shared/models/productCard';

@Component({
  selector: 'app-sponsored-products',
  imports: [CarouselModule, TranslateModule, ProductCard],
  templateUrl: './sponsored-products.html',
  styleUrl: './sponsored-products.css',
})
export class SponsoredProducts {
  products1: IProductCard[] = [

    {
      id: 2,
      title: 'ساعة يد',
      category: 'اكسسوارات',
      price: 500,
      currency: 'جنيها',
      imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
      rating: 3
    },
    {
      id: 3,
      title: 'حذاء رياضي',
      category: 'أحذية',
      price: 800,
      currency: 'جنيها',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
      rating: 4
    },
    {
      id: 4,
      title: 'حقيبة يد',
      category: 'شنط',
      price: 600,
      currency: 'جنيها',
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
      rating: 5
    }
    ,
    {
      id: 3,
      title: 'حذاء رياضي',
      category: 'أحذية',
      price: 800,
      currency: 'جنيها',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
      rating: 4
    },
    {
      id: 4,
      title: 'حقيبة يد',
      category: 'شنط',
      price: 600,
      currency: 'جنيها',
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
      rating: 5
    }
  ];

  products2: IProductCard[] = [
    {
      id: 5,
      title: 'فستان مناسبات',
      category: 'هدوم حريمي',
      price: 1000,
      currency: 'جنيها',
      imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
      rating: 4
    },
    {
      id: 6,
      title: 'نظارة شمسية',
      category: 'اكسسوارات',
      price: 300,
      currency: 'جنيها',
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
      rating: 4
    },
    {
      id: 8,
      title: 'سماعة رأس',
      category: 'الكترونيات',
      price: 1200,
      currency: 'جنيها',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
      rating: 5
    }
  ];

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
}
