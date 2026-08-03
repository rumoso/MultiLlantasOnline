import { Routes } from "@angular/router";


export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/main/main.component'),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component'),
      },
      {
        path: 'cart',
        loadComponent: () => import('./pages/cart/cart-page.component'),
      },
      {
        path: 'my-purchases',
        loadComponent: () => import('./pages/my-purchases/my-purchases.component'),
      },
      {
        path: 'favorites',
        loadComponent: () => import('./pages/my-favorites/my-favorites.component'),
      },
      {
        path: 'product/:id',
        loadComponent: () => import('./pages/product-details/product-details.component'),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil.component'),
      },
      {
        path: 'checkout',
        loadComponent: () => import('./pages/checkout/checkout.component'),
      },
      {
        path: 'checkout/resultado',
        loadComponent: () => import('./pages/checkout/checkout-resultado.component'),
      }
    ]
  }
]
