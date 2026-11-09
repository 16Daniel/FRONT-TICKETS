import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

export const PAGOS_ROUTES: Routes = [
  {
    path: 'administracion',
    canActivate: [permissionGuard('compras.ver')],
    children: [
      {
        path: '',
        redirectTo: 'compras',
        pathMatch: 'full',
      },
      {
        path: 'compras',
        title: 'Compras',
        canActivate: [permissionGuard('compras.ver')],
        loadComponent: () =>
          import('./layout/pagos-tabs/pagos-tabs.component'),
      },
    ],
  },
];

export default PAGOS_ROUTES;
