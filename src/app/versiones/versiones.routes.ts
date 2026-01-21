import { Routes } from '@angular/router';
import { AdminGuard } from '../shared/guards/admin.guard';

export const VERSIONES_ROUTES: Routes = [
  {
    path: 'version-control',
    title: 'Control de versiones',
    loadComponent: () =>
      import('./pages/version-control-page/version-control-page'),
    canActivate: [AdminGuard],
  },
  {
    path: 'version-history',
    title: 'Historial de versiones',
    loadComponent: () =>
      import('./pages/versions-history-page/versions-history.component'),
  },
];

export default VERSIONES_ROUTES;
