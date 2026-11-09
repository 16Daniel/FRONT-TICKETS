import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

export const CUPONES_MAIN_ROUTES: Routes = [
  {
    path: 'cupones',
    title: 'Cupones',
    canActivate: [permissionGuard('cupones.ver')],
    loadComponent: () =>
      import('./pages/cupones-page/cupones-page.component'),
  },
  {
    path: 'validador-api-local',
    title: 'Disponibilidad API Local',
    canActivate: [permissionGuard(['cupones.validador.ver', 'consumos.validador.ver'])],
    loadComponent: () =>
      import('./pages/validador-api-local/validador-api-local.component'),
  },
];

export default CUPONES_MAIN_ROUTES;
