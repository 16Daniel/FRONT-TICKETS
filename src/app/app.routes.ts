import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/main/home-a',
    pathMatch: 'full',
  },
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
      },
      {
        path: '',
        loadChildren: () => import('./activos-fijos/activos-fijos.routes').then(m => m.ACTIVOS_FIJOS_MAIN_ROUTES),
      },
      {
        path: '',
        loadChildren: () => import('./mantenimientos/mantenimientos.routes')
      },
      {
        path: '',
        loadChildren: () => import('./roles/roles.routes'),
      },
      {
        path: '',
        loadChildren: () => import('./usuarios/usuarios.routes'),
      },
      {
        path: '',
        loadChildren: () => import('./sucursales/sucursales.routes'),
      },
      {
        path: '',
        loadChildren: () => import('./areas/areas.routes'),
      },
      {
        path: '',
        loadChildren: () => import('./aceites/aceites.routes').then(m => m.ACEITES_MAIN_ROUTES),
      },
      {
        path: '',
        redirectTo: '/main/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    loadChildren: () => import('./nomina/nomina.routes')
  },
  {
    path: '',
    loadChildren: () => import('./activos-fijos/activos-fijos.routes').then(m => m.ACTIVOS_FIJOS_ROOT_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('./aceites/aceites.routes').then(m => m.ACEITES_ROOT_ROUTES),
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
    path: '',
    loadChildren: () => import('./auth/auth.routes'),
  },
  {
    path: '**',
    redirectTo: '/main/home-a',
  },
];
