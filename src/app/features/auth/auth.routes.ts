import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: "login",
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.Login),
    title: 'Login - Souknamasry',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then(
        (m) => m.Register
      ),
    title: 'Register - Souknamasry',
  },
];
