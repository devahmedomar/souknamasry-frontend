import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
    title: 'Admin Dashboard - Souknamasry',
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./pages/categories-page/categories-page').then((m) => m.CategoriesPage),
    title: 'Category Management - Souknamasry',
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/users-page/users-page').then((m) => m.UsersPage),
    title: 'User Management - Souknamasry',
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products-page/products-page').then((m) => m.ProductsPage),
    title: 'Product Management - Souknamasry',
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./pages/orders-page/orders-page').then((m) => m.OrdersPage),
    title: 'Order Management - Souknamasry',
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings-page/settings-page').then((m) => m.SettingsPage),
    title: 'Settings - Souknamasry',
  },
];
