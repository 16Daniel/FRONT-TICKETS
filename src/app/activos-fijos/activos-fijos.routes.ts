import { Routes } from '@angular/router';

/**
 * Rutas que viven dentro de /main
 */
export const ACTIVOS_FIJOS_MAIN_ROUTES: Routes = [
  {
    path: 'fixed-assets',
    title: 'Activos fijos',
    loadComponent: () =>
      import('./pages/fixed-assets/fixed-assets.component'),
  },
];

/**
 * Rutas globales (fuera de /main)
 */
export const ACTIVOS_FIJOS_ROOT_ROUTES: Routes = [
  {
    path: 'fixed-assets/detail/:referencia',
    title: 'Detalle del activo fijo',
    loadComponent: () =>
      import('./pages/detail/detail.component'),
  },
];

export default {
  ACTIVOS_FIJOS_MAIN_ROUTES,
  ACTIVOS_FIJOS_ROOT_ROUTES,
};
