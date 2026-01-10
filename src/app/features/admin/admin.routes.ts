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
  // Future routes:
  // { path: 'products', ... }
  // { path: 'orders', ... }
  // { path: 'users', ... }
];
