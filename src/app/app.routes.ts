import { Routes } from '@angular/router';
import { HomeGuard } from './shared/guards/home.guard';
import { AdminGuard } from './shared/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'main',
    loadComponent: () => import('./shared/layout/main/main.component'),
    // canActivateChild:[authGuard],
    children: [
      {
        path: 'home',
        title: 'Inicio',
        loadComponent: () => import('./tickets/pages/home/home.component'),
        canActivate: [HomeGuard],
      },
      {
        path: 'home-s',
        title: 'Inicio',
        loadComponent: () => import('./tickets/pages/analyst-home/analyst-home.component'),
        canActivate: [HomeGuard],
      },
      {
        path: 'home-a',
        title: 'Inicio',
        loadComponent: () => import('./tickets/pages/admin-home/admin-home.component'),
        canActivate: [HomeGuard],
      },
      {
        path: 'home-specialist',
        title: 'Inicio',
        loadComponent: () => import('./tickets/pages/specialist-home/specialist-home.component'),
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
        loadComponent: () => import('./roles/pages/roles/roles.component'),
      },
      {
        path: 'users',
        title: 'Usuarios',
        loadComponent: () => import('./usuarios/pages/users/users.component'),
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
        path: 'version-control',
        title: 'Control de versiones',
        loadComponent: () =>
          import('./versiones/pages/version-control/version-control.component'),
        canActivate: [AdminGuard],
      },
      {
        path: 'branches',
        title: 'Sucursales',
        loadComponent: () =>
          import('./sucursales/pages/branches/branches.component'),
        canActivate: [],
      },
      {
        path: 'categories',
        title: 'Categorias',
        loadComponent: () =>
          import('./tickets/pages/categories/categories.component'),
        canActivate: [],
      },
      {
        path: 'areas',
        title: 'Areas',
        loadComponent: () =>
          import('./areas/pages/areas/areas.component'),
        canActivate: [AdminGuard],
      },
      {
        path: 'kpis',
        title: 'KPIS',
        loadComponent: () =>
          import('./cedis/pages/admin-reports-tab/admin-reports-tab.component')
      },
      {
        path: 'version-history',
        title: 'Historial de versiones',
        loadComponent: () =>
          import('./versiones/pages/versions-history/versions-history.component'),
      },
      {
        path: 'fixed-assets',
        title: 'Activos fijos',
        loadComponent: () =>
          import('./activos-fijos/pages/fixed-assets/fixed-assets.component'),
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
    loadComponent: () => import('./nomina/pages/nomina/nomina.component'),
    children: [
      {
        path: 'constructor-de-calendarios',
        title: 'Constructor de calendarios',
        loadComponent: () => import('./nomina/pages/work-shift-calendar/work-shift-calendar.component'),
      },
      {
        path: 'control-de-personal',
        title: 'Control del personal',
        loadComponent: () => import('./nomina/pages/staff-control/staff-control.component'),
      },
      {
        path: 'historial-del-personal',
        title: 'Historial del personal',
        loadComponent: () => import('./nomina/pages/historial-personal/historial-personal.component'),
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
    loadComponent: () => import('./cedis/pages/cedis/cedis.component'),
    children: [
      {
        path: 'recoleccion',
        title: 'Control de aceite',
        loadComponent: () => import('./cedis/pages/recoleccion-aceite/recoleccion-aceite.component'),
      },
      {
        path: 'control-aceite',
        title: 'Control de aceite',
        loadComponent: () => import('./cedis/pages/aceite/aceite.component'),
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
        loadComponent: () => import('./auth/pages/login/login.component'),
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
      import('./activos-fijos/pages/detail/detail.component'),
  },
  {
    path: 'administracion',
    children: [
      {
        path: '',
        redirectTo: '/administracion/compras',
        pathMatch: 'full',
      },
      {
        path: 'compras',
        title: 'Compras',
        loadComponent: () => import('./pagos/pages/pagos-tabs/pagos-tabs.component'),
      }
    ]
  },
  {
    path: 'inventario',
    loadComponent: () => import('./cedis/pages/stock/stock.component'),
    children: [
      {
        path: '',
        redirectTo: '/inventario/captura',
        pathMatch: 'full',
      },
      {
        path: 'captura',
        title: 'Captura de inventario',
        loadComponent: () => import('./cedis/pages/captura-inventario-diario/captura-inventario-diario.component'),
      }
    ]
  },
  {
    path: 'planeacion',
    loadComponent: () => import('./planeacion/pages/planeacion/Planeacion.component'),
    children: [
      {
        path: '',
        redirectTo: '/planeacion/diccionario',
        pathMatch: 'full',
      },
      {
        path: 'diccionario',
        title: 'Diccionario',
        loadComponent: () => import('./planeacion/pages/Diccionario/Diccionario.component'),
      },
      {
        path: 'mermas',
        title: 'Mermas',
        loadComponent: () => import('./planeacion/pages/mermas/mermas.component'),
      }
    ]
  },
];
