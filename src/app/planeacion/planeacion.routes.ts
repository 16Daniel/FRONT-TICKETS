import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

export const PLANEACION_ROUTES: Routes = [
  {
    path: 'planeacion',
    loadComponent: () =>
      import('./pages/planeacion-page/planeacion-page.component'),
    canActivate: [permissionGuard(['planeacion.diccionario.ver', 'planeacion.mermas.ver'])],
    children: [
      {
        path: '',
        redirectTo: 'diccionario',
        pathMatch: 'full',
      },
      {
        path: 'diccionario',
        title: 'Diccionario',
        canActivate: [permissionGuard('planeacion.diccionario.ver')],
        loadComponent: () =>
          import('./pages/diccionario-page/diccionario-page.component'),
      },
      {
        path: 'mermas',
        title: 'Mermas',
        canActivate: [permissionGuard('planeacion.mermas.ver')],
        loadComponent: () =>
          import('./pages/mermas-page/mermas-page.component'),
      },
    ],
  },
  {
    path: 'inventario',
    loadComponent: () =>
      import('./pages/stock-page/stock-page.component'),
    canActivate: [permissionGuard('inventario.captura.ver')],
    children: [
      {
        path: '',
        redirectTo: 'captura',
        pathMatch: 'full',
      },
      {
        path: 'captura',
        title: 'Captura de inventario',
        canActivate: [permissionGuard('inventario.captura.ver')],
        loadComponent: () =>
          import('../aceites/pages/captura-inventario-diario-page/captura-inventario-diario-page.component'),
      },
    ],
  },
];

export default PLANEACION_ROUTES;
