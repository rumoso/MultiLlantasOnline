import { Routes } from '@angular/router';
import MainComponent from './pages/main/main.component';
import LoginComponent from './pages/login/login.component';

export const routes: Routes = [
    {
        path: '',
        //loadComponent: () => import('./pages/main/main.component'),
        component: MainComponent,
        children: [
            {
                path: 'login',
                //loadComponent: () => import('./pages/login/login.component'),
                component: LoginComponent
            },
            {
                path: '**',
                redirectTo: 'home'
            }
        ]

    }
];
