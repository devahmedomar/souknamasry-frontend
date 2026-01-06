import { Routes } from '@angular/router';

export const favouritesRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/favourites-page/favourites-page').then(m => m.FavouritesPage),
        title: 'Favourites - Souknamasry'
    }
];
