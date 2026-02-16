import { Routes } from '@angular/router';
import { ResponsableGuard } from './shared/guards/responsable.guard';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/main/home-a',
    pathMatch: 'full',
  },
  {
    path: 'main',
    loadComponent: () => import('./shared/layout/main/main.component'),
    canActivate: [ResponsableGuard],
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
        redirectTo: '/main/home-a',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    canActivate: [AuthGuard, ResponsableGuard],
    loadChildren: () => import('./nomina/nomina.routes')
  },
  {
    path: '',
    canActivate: [AuthGuard, ResponsableGuard],
    loadChildren: () => import('./activos-fijos/activos-fijos.routes').then(m => m.ACTIVOS_FIJOS_ROOT_ROUTES),
  },
  {
    path: '',
    canActivate: [AuthGuard, ResponsableGuard],
    loadChildren: () => import('./aceites/aceites.routes').then(m => m.ACEITES_ROOT_ROUTES),
  },
  {
    path: '',
    canActivate: [AuthGuard, ResponsableGuard],
    loadChildren: () => import('./pagos/pagos.routes')
  },
  {
    path: '',
    canActivate: [AuthGuard, ResponsableGuard],
    loadChildren: () => import('./planeacion/planeacion.routes')
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () => import('./tareas/tareas.routes')
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
