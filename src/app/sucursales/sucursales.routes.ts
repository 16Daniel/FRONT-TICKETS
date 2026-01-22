import { Routes } from '@angular/router';

export const SUCURSALES_MAIN_ROUTES: Routes = [
  {
    path: 'branches',
    title: 'Sucursales',
    loadComponent: () =>
      import('./pages/branches-page/branches-page'),
  },
];

export default SUCURSALES_MAIN_ROUTES;
