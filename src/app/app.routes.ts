import { Routes } from '@angular/router';
import { HomeGuard } from './guards/home.guard';
import { AdminGuard } from './guards/admin.guard';
import { BranchGuard } from './guards/branch.guard';
import { AnalystGuard } from './guards/analyst.guard';

export const routes: Routes = [
  {
    path: 'main',
    loadComponent: () => import('./pages/main/main.component'),
    // canActivateChild:[authGuard],
    children: [
      {
        path: 'home',
        title: 'Inicio',
        loadComponent: () => import('./pages/branch/home/home.component'),
        canActivate: [HomeGuard],
      },
      {
        path: 'home-s',
        title: 'Inicio',
        loadComponent: () => import('./pages/analyst/analyst-home/analyst-home.component'),
        canActivate: [HomeGuard],
      },
      {
        path: 'home-a',
        title: 'Inicio',
        loadComponent: () => import('./pages/admin/admin-home/admin-home.component'),
        canActivate: [HomeGuard],
      },
      {
        path: '',
        redirectTo: '/main/home',
        pathMatch: 'full',
      },
      {
        path: 'roles',
        title: 'Roles de usuarios',
        loadComponent: () => import('./pages/admin/roles/roles.component'),
      },
      {
        path: 'users',
        title: 'Usuarios',
        loadComponent: () => import('./pages/admin/users/users.component'),
      },
      {
        path: 'calendar-builder',
        title: 'Constructor de calendarios',
        loadComponent: () =>
          import('./pages/admin/calendar-builder/calendar-builder.component'),
      },
      {
        path: 'branch-visit-schedule',
        title: 'Visitas programadas',
        loadComponent: () =>
          import(
            './pages/analyst/branch-visit-schedule/branch-visit-schedule.component'
          ),
      },
      {
        path: 'version-control',
        title: 'Control de versiones',
        loadComponent: () =>
          import('./pages/admin/version-control/version-control.component'),
        canActivate: [AdminGuard],
      },
      {
        path: 'version-history',
        title: 'Historial de versiones',
        loadComponent: () =>
          import('./pages/versions-history/versions-history.component'),
      },
    ],
  },
  {
    path: '',
    redirectTo: '/main',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        title: 'Login',
        loadComponent: () => import('./auth/login/login.component'),
      },
      {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full',
      },
    ],
  },
];
