import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

/**
 * Rutas que viven dentro de /main
 */
export const ACEITES_MAIN_ROUTES: Routes = [
  {
    path: 'control-aceite',
    title: 'Control de aceite',
    canActivate: [permissionGuard('aceites.control.ver')],
    loadComponent: () =>
      import('./pages/aceite-page/aceite-page.component'),
  },
];

/**
 * Rutas globales (fuera de /main)
 */
export const ACEITES_ROOT_ROUTES: Routes = [
  {
    path: 'cedis',
    loadComponent: () =>
      import('./pages/cedis-page/cedis-page.component'),
    canActivate: [permissionGuard(['aceites.recoleccion.ver', 'aceites.control.ver'])],
    children: [
      {
        path: '',
        redirectTo: 'recoleccion',
        pathMatch: 'full',
      },
      {
        path: 'recoleccion',
        title: 'Recolección de aceite',
        canActivate: [permissionGuard('aceites.recoleccion.ver')],
        loadComponent: () =>
          import('./pages/recoleccion-aceite-page/recoleccion-aceite-page.component'),
      },
      {
        path: 'control-aceite',
        title: 'Control de aceite',
        canActivate: [permissionGuard('aceites.control.ver')],
        loadComponent: () =>
          import('./pages/aceite-page/aceite-page.component'),
      },
    ],
  },
  {
    path: 'inventario',
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
          import('./pages/captura-inventario-diario-page/captura-inventario-diario-page.component'),
      },
    ],
  },
];

export default {
  ACEITES_MAIN_ROUTES,
  ACEITES_ROOT_ROUTES,
};
