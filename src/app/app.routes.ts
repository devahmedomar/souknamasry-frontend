import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/pages/home-page/home-page').then((m) => m.HomePage),
        title: 'Home - ShopName',
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.routes').then((m) => m.productRoutes),
        title: 'Products - ShopName',
      },
    ],
  },
];
