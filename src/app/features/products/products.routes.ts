import { Routes } from '@angular/router';

export const productRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/product-list-page/product-list-page').then((m) => m.ProductListPage),
    title: 'Products - ShopName',
  },
  // Product Detail Page
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/product-detail-page/product-detail-page').then(
        (m) => m.ProductDetailPage
      ),
    title: 'Product Details - ShopName',
  },
];
