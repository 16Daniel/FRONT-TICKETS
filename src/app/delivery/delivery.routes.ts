import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

export const DELIVERY_ROUTES: Routes = [
  {
    path: 'diccionario-delivery',
    canActivate: [permissionGuard('delivery.diccionario.ver')],
    loadComponent: () =>
      import('./pages/diccionario-delivery-page/diccionario-delivery-page.component'),
  }
];

export default DELIVERY_ROUTES;
