import { Routes } from '@angular/router';

export const routes: Routes = [
{
    path:'main',
    loadComponent: () => import('./pages/main/main.component'),
    // canActivateChild:[authGuard],
    children:
    [
        {
            path:'home',
            title:'Inicio',
            loadComponent: () => import('./pages/home/home.component')
        },
        {
            path:'home-s',
            title:'Inicio',
            loadComponent: () => import('./pages/home-s/home-s.component')
        },
        {
            path:'home-a',
            title:'Inicio',
            loadComponent: () => import('./pages/home-A/home-A.component')
        },
        {
            path: '',
            redirectTo: '/main/home',
            pathMatch: 'full'
        },
        {
            path:'roles',
            title:'Roles de usuarios',
            loadComponent: () => import('./pages/roles/roles.component')
        },
        {
            path:'users',
            title:'Usuarios',
            loadComponent: () => import('./pages/users/users.component')
        },
        {
            path:'calendar-builder',
            title:'Constructor de calendarios',
            loadComponent: () => import('./pages/calendar-builder/calendar-builder.component')
        },
        {
            path:'branch-visit-schedule',
            title:'Visitas programadas',
            loadComponent: () => import('./pages/branch-visit-schedule/branch-visit-schedule.component')
        },
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
