import { Routes } from "@angular/router";


export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/main/main.component'),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component'),
      }
    ]
  }
]
