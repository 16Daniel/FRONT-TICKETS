import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
{
    path:'main',
    loadComponent: () => import('./main/main.component'),
    // canActivateChild:[authGuard],
    children:
    [
        {
            path:'home',
            title:'Inicio',
            loadComponent: () => import('./main/pages/Home/Home.component')
        },
        {
            path:'home-a',
            title:'Inicio',
            loadComponent: () => import('./main/pages/HomeA/HomeA.component')
        },
        {
            path: '',
            redirectTo: '/main/home',
            pathMatch: 'full'
        },
        {
            path:'roles',
            title:'Roles de usuarios',
            loadComponent: () => import('./main/pages/Roles/Roles.component')
        },
        {
            path:'users',
            title:'Usuarios',
            loadComponent: () => import('./main/pages/Users/Users.component')
        },
        {
            path:'ticket/:idt',
            title:'Ticket',
            loadComponent: () => import('./main/pages/Ticket/Ticket.component')
        }
    ]
},
{
    path: '',
    redirectTo: '/main',
    pathMatch: 'full'
},
{
    path:'auth',
    children:
    [
        {
            path:'login',
            title:'Login',
            loadComponent: () => import('./auth/login/login.component')
        },
        {
            path: '',
            redirectTo: '/auth/login',
            pathMatch: 'full'
        }
    ]
}

];
