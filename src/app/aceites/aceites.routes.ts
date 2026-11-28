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
      import('./pages/control-aceite-page/control-aceite-page.component'),
  },
  {
    path: 'recoleccion-aceite',
    title: 'Recolección de aceite',
    canActivate: [permissionGuard('aceites.recoleccion.ver')],
    loadComponent: () =>
      import('./pages/recoleccion-aceite-page/recoleccion-aceite-page.component'),
  },
  {
    path: 'captura-inventario',
    title: 'Captura de inventario',
    canActivate: [permissionGuard('inventario.captura.ver')],
    loadComponent: () =>
      import('./pages/captura-inventario-diario-page/captura-inventario-diario-page.component'),
  },
];

export default ACEITES_MAIN_ROUTES;
