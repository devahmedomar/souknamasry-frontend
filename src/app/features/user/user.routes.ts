import { Routes } from '@angular/router';

export const userRoutes: Routes = [
    {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
    },
    {
        path: 'profile',
        loadComponent: () =>
            import('./pages/profile-page/profile-page').then((m) => m.ProfilePage),
        title: 'Profile - Souknamasry'
    }
];
