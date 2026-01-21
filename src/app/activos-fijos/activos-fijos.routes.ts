import { Routes } from '@angular/router';

export const FIXED_ASSETS_ROUTES: Routes = [
  {
    path: 'fixed-assets',
    title: 'Activos fijos',
    loadComponent: () =>
      import('./pages/fixed-assets/fixed-assets.component'),
  },
  {
    path: 'fixed-assets/detail/:referencia',
    title: 'Detalle del activo fijo',
    loadComponent: () =>
      import('./pages/detail/detail.component'),
  },
];

export default FIXED_ASSETS_ROUTES;
