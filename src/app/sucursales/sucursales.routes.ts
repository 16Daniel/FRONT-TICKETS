import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

export const SUCURSALES_MAIN_ROUTES: Routes = [
  {
    path: 'branches',
    title: 'Sucursales',
    canActivate: [permissionGuard('sucursales.ver')],
    loadComponent: () =>
      import('./pages/branches-page/branches-page.component'),
  },
  {
    path: 'precios-ayc',
    title: 'PRECIOS AYC',
    canActivate: [permissionGuard('planeacion.precios_ayc.ver')],
    loadComponent: () =>
      import('./pages/precios-ayc-page.component/precios-ayc-page.component'),
  },
];

export default SUCURSALES_MAIN_ROUTES;
