import { Routes } from '@angular/router';

export const SUCURSALES_MAIN_ROUTES: Routes = [
  {
    path: 'branches',
    title: 'Sucursales',
    loadComponent: () =>
      import('./pages/branches-page/branches-page.component'),
  },
  {
    path: 'precios-ayc',
    title: 'PRECIOS AYC',
    loadComponent: () =>
      import('./pages/precios-ayc-page.component/precios-ayc-page.component'),
  },
];

export default SUCURSALES_MAIN_ROUTES;
