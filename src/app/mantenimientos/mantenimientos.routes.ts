import { Routes } from '@angular/router';

export const MANTENIMIENTOS_MAIN_ROUTES: Routes = [
  {
    path: 'calendar-builder',
    title: 'Constructor de calendarios',
    loadComponent: () =>
      import('./pages/constructor-calendario-page/constructor-calendario-page.component'),
  },
  {
    path: 'branch-visit-schedule',
    title: 'Visitas programadas',
    loadComponent: () =>
      import('./pages/branch-visit-schedule-page/branch-visit-schedule-page.component'),
  },
];

export default MANTENIMIENTOS_MAIN_ROUTES;
