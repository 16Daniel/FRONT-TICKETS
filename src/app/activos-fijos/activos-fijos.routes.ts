import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

/**
 * Rutas que viven dentro de /main
 */
export const ACTIVOS_FIJOS_MAIN_ROUTES: Routes = [
  {
    path: 'activos-fijos',
    title: 'Activos fijos',
    canActivate: [permissionGuard('activos_fijos.ver')],
    loadComponent: () =>
      import('./pages/activos-fijos-page/activos-fijos-page.component'),
  },
];

/**
 * Rutas globales (fuera de /main)
 */
export const ACTIVOS_FIJOS_ROOT_ROUTES: Routes = [
  {
    path: 'activos-fijos/detalle/:referencia',
    title: 'Detalle del activo fijo',
    canActivate: [permissionGuard('activos_fijos.ver')],
    loadComponent: () =>
      import('./pages/activo-fijo-detalle-page/activo-fijo-detalle-page.component'),
  },
];

export default {
  ACTIVOS_FIJOS_MAIN_ROUTES,
  ACTIVOS_FIJOS_ROOT_ROUTES,
};
