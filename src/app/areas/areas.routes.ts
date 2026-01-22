import { Routes } from '@angular/router';
import { AdminGuard } from '../shared/guards/admin.guard';

export const AREAS_MAIN_ROUTES: Routes = [
  {
    path: 'areas',
    title: 'Areas',
    canActivate: [AdminGuard],
    loadComponent: () =>
      import('./pages/areas/areas.component'),
  },
];

export default AREAS_MAIN_ROUTES;
