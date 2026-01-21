import { Routes } from '@angular/router';
import { AdminGuard } from './shared/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'main',
    loadComponent: () => import('./shared/layout/main/main.component'),
    children: [
      {
        path: '',
        loadChildren: () => import('./tickets/tickets.routes')
      },
      {
        path: '',
        loadChildren: () => import('./versiones/versiones.routes')
        // sacar
      },
      {
        path: '',
        redirectTo: '/main/home',
        pathMatch: 'full',
      },
      {
        path: 'roles',
        title: 'Roles de usuarios',
        loadComponent: () => import('./roles/pages/roles/roles.component'),
        // sacar
      },
      {
        path: 'users',
        title: 'Usuarios',
        loadComponent: () => import('./usuarios/pages/users-page/users-page'),
        // sacar
      },
      {
        path: 'calendar-builder',
        title: 'Constructor de calendarios',
        loadComponent: () =>
          import('./mantenimientos/pages/calendar-builder/calendar-builder.component'),
      },
      {
        path: 'branch-visit-schedule',
        title: 'Visitas programadas',
        loadComponent: () =>
          import(
            './mantenimientos/pages/branch-visit-schedule/branch-visit-schedule.component'
          ),
      },
      {
        path: 'branches',
        title: 'Sucursales',
        loadComponent: () =>
          import('./sucursales/pages/branches-page/branches-page'),
        canActivate: [],
        // sacar
      },
      {
        path: 'areas',
        title: 'Areas',
        loadComponent: () =>
          import('./areas/pages/areas/areas.component'),
        canActivate: [AdminGuard],
        // sacar
      },
      {
        path: 'kpis',
        title: 'KPIS',
        loadComponent: () =>
          import('./aceites/pages/admin-reports-tab/admin-reports-tab.component')
      },
    ],
  },
  {
    path: '',
    redirectTo: '/main',
    pathMatch: 'full',
  },
  {
    path: '',
    loadChildren: () => import('./nomina/nomina.routes')
  },
  {
    path: '',
    loadChildren: () => import('./activos-fijos/activos-fijos.routes')
  },
  {
    path: '',
    loadChildren: () => import('./pagos/pagos.routes')
  },
  {
    path: '',
    loadChildren: () => import('./planeacion/planeacion.routes')
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        title: 'Login',
        loadComponent: () => import('./auth/pages/login/login.component'),
      },
      {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full',
      },
    ],
  },
];
