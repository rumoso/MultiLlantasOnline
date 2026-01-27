import { Routes } from '@angular/router';
import MainComponent from './pages/main/main.component';
import LoginComponent from './pages/login/login.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];
