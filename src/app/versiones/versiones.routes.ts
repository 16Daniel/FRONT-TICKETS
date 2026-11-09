import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

export const VERSIONES_ROUTES: Routes = [
  {
    path: 'version-control',
    title: 'Control de versiones',
    loadComponent: () =>
      import('./pages/version-control-page/version-control-page.component'),
    canActivate: [permissionGuard('versiones.control.ver')],
  },
  {
    path: 'version-history',
    title: 'Historial de versiones',
    loadComponent: () =>
      import('./pages/versions-history-page/versions-history.component'),
    canActivate: [permissionGuard('versiones.control.ver')],
  },
];

export default VERSIONES_ROUTES;
