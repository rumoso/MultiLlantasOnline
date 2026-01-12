import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes').then(m => m.routes)
    },
    {
        path: 'DiprolimWeb',
        loadChildren: () => import('./protected/protected.routes').then( m => m.routes ),
      },
      {
        path: '',
        redirectTo: 'DiprolimWeb/dashboard',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: 'DiprolimWeb/dashboard'
      }
];
