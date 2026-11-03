import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

export const MANTENIMIENTOS_MAIN_ROUTES: Routes = [
  {
    path: 'calendar-builder',
    title: 'Constructor de calendarios',
    canActivate: [permissionGuard('visitas.constructor.ver')],
    loadComponent: () =>
      import('./pages/constructor-calendario-page/constructor-calendario-page.component'),
  },
  {
    path: 'branch-visit-schedule',
    title: 'Visitas programadas',
    canActivate: [permissionGuard('visitas.calendario.ver')],
    loadComponent: () =>
      import('./pages/branch-visit-schedule-page/branch-visit-schedule-page.component'),
  },
];

export default MANTENIMIENTOS_MAIN_ROUTES;
