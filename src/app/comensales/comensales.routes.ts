import { Routes } from '@angular/router';

export const COMENSALES_ROUTES: Routes = [
  {
    path: 'comensales',
    title: 'Comensales',
    loadComponent: () =>
      import('./pages/comensales-page/comensales-page').then((m) => m.ComensalesPage),
  },
];

export default COMENSALES_ROUTES;
