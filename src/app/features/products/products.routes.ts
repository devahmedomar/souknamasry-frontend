import { Routes } from '@angular/router';

export const productRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/categories/categories').then((m) => m.Categories),
    title: 'Products - Souknamasry',
  },
  // Product Detail Page
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/product-detail-page/product-detail-page').then(
        (m) => m.ProductDetailPage
      ),
    title: 'Product Details - Souknamasry',
  },
];
