import { Routes } from '@angular/router';

export const productRoutes: Routes = [
  {
    path: '**',
    loadComponent: () =>
      import('./pages/categories/categories').then((m) => m.Categories),
    title: 'Products - Souknamasry',
  },
];
