import { Routes } from '@angular/router';
import { adminGuard } from './shared/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
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
        loadChildren: () => import('./features/cart/cart.routes').then((m) => m.cartRoutes),
        title: 'عربة التسوق - سوقنا مصري',
      },
      {
        path: 'user',
        loadChildren: () => import('./features/user/user.routes').then((m) => m.userRoutes),
        title: 'حسابي - سوقنا مصري',
      },
      {
        path: 'favourites',
        loadChildren: () =>
          import('./features/favourites/favourites.routes').then((m) => m.favouritesRoutes),
        title: 'المفضلة - سوقنا مصري',
      },
      {
        path: 'privacy',
        loadComponent: () =>
          import('./features/static/static-page/static-page').then((m) => m.StaticPage),
        title: 'سياسة الخصوصية - سوقنا مصري',
        data: {
          titleKey: 'STATIC_PAGES.PRIVACY_TITLE',
          contentKey: 'STATIC_PAGES.PRIVACY_CONTENT',
          urlPath: '/privacy',
          description: 'سياسة الخصوصية لموقع سوقنا مصري — كيف نجمع بياناتك ونحميها.',
        },
      },
      {
        path: 'terms',
        loadComponent: () =>
          import('./features/static/static-page/static-page').then((m) => m.StaticPage),
        title: 'الشروط والأحكام - سوقنا مصري',
        data: {
          titleKey: 'STATIC_PAGES.TERMS_TITLE',
          contentKey: 'STATIC_PAGES.TERMS_CONTENT',
          urlPath: '/terms',
          description: 'الشروط والأحكام لاستخدام موقع سوقنا مصري.',
        },
      },
      {
        path: 'shipping-policy',
        loadComponent: () =>
          import('./features/static/static-page/static-page').then((m) => m.StaticPage),
        title: 'سياسة الشحن - سوقنا مصري',
        data: {
          titleKey: 'STATIC_PAGES.SHIPPING_TITLE',
          contentKey: 'STATIC_PAGES.SHIPPING_CONTENT',
          urlPath: '/shipping-policy',
          description: 'سياسة الشحن والتوصيل في سوقنا مصري لجميع أنحاء مصر.',
        },
      },
      {
        path: 'return-policy',
        loadComponent: () =>
          import('./features/static/static-page/static-page').then((m) => m.StaticPage),
        title: 'سياسة الإرجاع - سوقنا مصري',
        data: {
          titleKey: 'STATIC_PAGES.RETURN_TITLE',
          contentKey: 'STATIC_PAGES.RETURN_CONTENT',
          urlPath: '/return-policy',
          description: 'سياسة الإرجاع والاسترداد في سوقنا مصري.',
        },
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/static/static-page/static-page').then((m) => m.StaticPage),
        title: 'تواصل معنا - سوقنا مصري',
        data: {
          titleKey: 'STATIC_PAGES.CONTACT_TITLE',
          contentKey: 'STATIC_PAGES.CONTACT_CONTENT',
          urlPath: '/contact',
          description: 'تواصل مع فريق سوقنا مصري — دعم العملاء والاستفسارات التجارية.',
        },
      },
      {
        path: 'help',
        loadComponent: () =>
          import('./features/static/static-page/static-page').then((m) => m.StaticPage),
        title: 'مركز المساعدة - سوقنا مصري',
        data: {
          titleKey: 'STATIC_PAGES.HELP_TITLE',
          contentKey: 'STATIC_PAGES.HELP_CONTENT',
          urlPath: '/help',
          description: 'مركز المساعدة — إجابات على أكثر الأسئلة شيوعًا حول التسوق في سوقنا مصري.',
        },
      },
      // {
      //   path: '**',
      //   loadComponent: () =>
      //     import('./features/error/not-found/not-found').then((m) => m.NotFoundPage),
      //   title: 'الصفحة غير موجودة - سوقنا مصري',
      // },
    ],
  },
  {
    path: 'auth',
    // Lazy load AuthLayout — never needed on public pages
    loadComponent: () => import('./layout/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
        title: 'تسجيل الدخول - سوقنا مصري',
      },
    ],
  },
  {
    path: 'admin',
    // Lazy load AdminLayout — this alone saves ~200-300 KiB PrimeNG admin JS on public pages
    loadComponent: () => import('./layout/admin-layout/admin-layout').then((m) => m.AdminLayout),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
        title: 'لوحة الإدارة - سوقنا مصري',
      },
    ],
  },
];
