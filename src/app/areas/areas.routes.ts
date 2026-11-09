import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

export const AREAS_MAIN_ROUTES: Routes = [
  {
    path: 'areas',
    title: 'Areas',
    canActivate: [permissionGuard('areas.ver')],
    loadComponent: () =>
      import('./pages/areas-page/areas-page.component'),
  },
];

export default AREAS_MAIN_ROUTES;
