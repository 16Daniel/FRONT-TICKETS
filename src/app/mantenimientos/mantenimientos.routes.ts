import { Routes } from '@angular/router';

export const MANTENIMIENTOS_MAIN_ROUTES: Routes = [
  {
    path: 'calendar-builder',
    title: 'Constructor de calendarios',
    loadComponent: () =>
      import('./pages/calendar-builder/calendar-builder.component'),
  },
  {
    path: 'branch-visit-schedule',
    title: 'Visitas programadas',
    loadComponent: () =>
      import('./pages/branch-visit-schedule/branch-visit-schedule.component'),
  },
];

export default MANTENIMIENTOS_MAIN_ROUTES;
