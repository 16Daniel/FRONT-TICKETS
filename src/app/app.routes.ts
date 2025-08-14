import { Routes } from '@angular/router';
import { HomeGuard } from './guards/home.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: 'main',
    loadComponent: () => import('./pages/main/main.component'),
    // canActivateChild:[authGuard],
    children: [
      {
        path: 'home',
        title: 'Inicio',
        loadComponent: () => import('./pages/branch/pages/home/home.component'),
        canActivate: [HomeGuard],
      },
      {
        path: 'home-s',
        title: 'Inicio',
        loadComponent: () => import('./pages/analyst/pages/analyst-home/analyst-home.component'),
        canActivate: [HomeGuard],
      },
      {
        path: 'home-a',
        title: 'Inicio',
        loadComponent: () => import('./pages/admin/pages/admin-home/admin-home.component'),
        canActivate: [HomeGuard],
      },
      {
        path: 'home-specialist',
        title: 'Inicio',
        loadComponent: () => import('./pages/specialist/pages/specialist-home/specialist-home.component'),
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
        loadComponent: () => import('./pages/admin/pages/roles/roles.component'),
      },
      {
        path: 'users',
        title: 'Usuarios',
        loadComponent: () => import('./pages/admin/pages/users/users.component'),
      },
      {
        path: 'calendar-builder',
        title: 'Constructor de calendarios',
        loadComponent: () =>
          import('./pages/admin/pages/calendar-builder/calendar-builder.component'),
      },
      {
        path: 'branch-visit-schedule',
        title: 'Visitas programadas',
        loadComponent: () =>
          import(
            './pages/analyst/pages/branch-visit-schedule/branch-visit-schedule.component'
          ),
      },
      {
        path: 'version-control',
        title: 'Control de versiones',
        loadComponent: () =>
          import('./pages/admin/pages/version-control/version-control.component'),
        canActivate: [AdminGuard],
      },
      {
        path: 'branches',
        title: 'Sucursales',
        loadComponent: () =>
          import('./pages/admin/pages/branches/branches.component'),
        canActivate: [],
      },
      {
        path: 'categories',
        title: 'Categorias',
        loadComponent: () =>
          import('./pages/admin/pages/categories/categories.component'),
        canActivate: [],
      },
      {
        path: 'areas',
        title: 'Areas',
        loadComponent: () =>
          import('./pages/admin/pages/areas/areas.component'),
        canActivate: [AdminGuard],
      },
        {
        path: 'kpis',
        title: 'KPIS',
        loadComponent: () =>
          import('./pages/admin/components/admin-reports-tab/admin-reports-tab.component'),
        canActivate: [AdminGuard],
      },
      {
        path: 'version-history',
        title: 'Historial de versiones',
        loadComponent: () =>
          import('./pages/versions-history/versions-history.component'),
      },
      {
        path: 'fixed-assets',
        title: 'Activos fijos',
        loadComponent: () =>
          import('./pages/admin/pages/fixed-assets/fixed-assets.component'),
      },
    ],
  },
  {
    path: '',
    redirectTo: '/main',
    pathMatch: 'full',
  },
  {
    path: 'nomina',
    loadComponent: () => import('./pages/Nomina/nomina.component'),
    children: [
      {
        path: 'constructor-de-calendarios',
        title: 'Constructor de calendarios',
        loadComponent: () => import('./pages/Nomina/work-shift-calendar/work-shift-calendar.component'),
      },
      {
        path: 'control-de-personal',
        title: 'Control del personal',
        loadComponent: () => import('./pages/Nomina/staff-control/staff-control.component'),
      },
      {
        path: '',
        redirectTo: '/nomina/constructor-de-calendarios',
        pathMatch: 'full',
      },
    ]
  },
  {
    path: 'cedis',
    loadComponent: () => import('./pages/cedis/cedis.component'),
    children: [
      {
        path: 'recoleccion',
        title: 'Control de aceite',
        loadComponent: () => import('./pages/cedis/recoleccion-aceite/recoleccion-aceite.component'),
      },
      {
        path: 'control-aceite',
        title: 'Control de aceite',
        loadComponent: () => import('./pages/cedis/aceite/aceite.component'),
      },
      {
        path: '',
        redirectTo: '/cedis/recoleccion',
        pathMatch: 'full',
      },
    ]
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
  {
    path: 'fixed-assets/detail/:referencia',
    title: 'Detalle del activos fijo',
    loadComponent: () =>
      import('./pages/fixed-assets/pages/detail/detail.component'),
  },
];
