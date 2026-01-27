import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.routes)
  },
  {
    path: 'Multillantas',
    loadChildren: () => import('./protected/protected.routes').then(m => m.routes),
  },
  {
    path: '',
    redirectTo: 'Multillantas/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'Multillantas/dashboard'
  }
];
