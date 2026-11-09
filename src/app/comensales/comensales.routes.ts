import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

export const COMENSALES_ROUTES: Routes = [
  {
    path: 'comensales',
    title: 'Comensales',
    canActivate: [permissionGuard('comensales.ver')],
    loadComponent: () =>
      import('./pages/comensales-page/comensales-page').then((m) => m.ComensalesPage),
  },
];

export default COMENSALES_ROUTES;
