import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { AuthLayout } from './layout/auth-layout/auth-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/pages/home-page/home-page').then((m) => m.HomePage),
        title: 'Home - Souknamasry',
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('./features/products/products.routes').then((m) => m.productRoutes),
        title: 'Products - Souknamasry',
      },
      {
        path: 'cart',
        loadChildren: () =>
          import('./features/cart/cart.routes').then((m) => m.cartRoutes),
        title: 'Cart - Souknamasry',
      },
      {
        path: 'user',
        loadChildren: () =>
          import('./features/user/user.routes').then((m) => m.userRoutes),
        title: 'Account - Souknamasry',
      },
      {
        path: 'favourites',
        loadChildren: () =>
          import('./features/favourites/favourites.routes').then((m) => m.favouritesRoutes),
        title: 'Favourites - Souknamasry',
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/auth/auth.routes').then((m) => m.authRoutes),
        title: 'Auth - Souknamasry',
      },
    ],
  }
];
