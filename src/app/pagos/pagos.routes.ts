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
        title: 'Requisición de Compras',
        canActivate: [permissionGuard('compras.ver')],
        loadComponent: () =>
          import('./pages/requisicion-compras-page/requisicion-compras-page.component'),
      },
    ],
  },
];

export default PAGOS_ROUTES;
