import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

export const PAGOS_MAIN_ROUTES: Routes = [
  {
    path: 'requisicion-compras',
    title: 'Requisición de Compras',
    canActivate: [permissionGuard('compras.ver')],
    loadComponent: () =>
      import('./pages/requisicion-compras-page/requisicion-compras-page.component'),
  },
];

export default PAGOS_MAIN_ROUTES;
