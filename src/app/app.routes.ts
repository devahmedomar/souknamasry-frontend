import { Routes } from '@angular/router';
import { adminGuard } from './shared/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/pages/home-page/home-page').then((m) => m.HomePage),
        title: 'الرئيسية - سوقنا مصري',
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('./features/products/products.routes').then((m) => m.productRoutes),
        title: 'التصنيفات - سوقنا مصري',
      },
      {
        path: 'product/:slug',
        loadComponent: () =>
          import('./features/products/pages/product-detail-page/product-detail-page').then(
            (m) => m.ProductDetailPage,
          ),
        title: 'تفاصيل المنتج - سوقنا مصري',
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./features/products/pages/search-results-page/search-results-page').then(
            (m) => m.SearchResultsPage,
          ),
        title: 'نتائج البحث - سوقنا مصري',
      },
      {
        path: 'cart',
        loadChildren: () =>
          import('./features/cart/cart.routes').then((m) => m.cartRoutes),
        title: 'عربة التسوق - سوقنا مصري',
      },
      {
        path: 'user',
        loadChildren: () =>
          import('./features/user/user.routes').then((m) => m.userRoutes),
        title: 'حسابي - سوقنا مصري',
      },
      {
        path: 'favourites',
        loadChildren: () =>
          import('./features/favourites/favourites.routes').then((m) => m.favouritesRoutes),
        title: 'المفضلة - سوقنا مصري',
      },
      {
        path: '**',
        loadComponent: () =>
          import('./features/error/not-found/not-found').then((m) => m.NotFoundPage),
        title: 'الصفحة غير موجودة - سوقنا مصري',
      },
    ],
  },
  {
    path: 'auth',
    // Lazy load AuthLayout — never needed on public pages
    loadComponent: () =>
      import('./layout/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/auth/auth.routes').then((m) => m.authRoutes),
        title: 'تسجيل الدخول - سوقنا مصري',
      },
    ],
  },
  {
    path: 'admin',
    // Lazy load AdminLayout — this alone saves ~200-300 KiB PrimeNG admin JS on public pages
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout').then((m) => m.AdminLayout),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/admin/admin.routes').then((m) => m.adminRoutes),
        title: 'لوحة الإدارة - سوقنا مصري',
      },
    ],
  },
];
