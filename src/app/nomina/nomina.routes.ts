import { Routes } from '@angular/router';

export const NOMINA_ROUTES: Routes = [
  {
    path: 'nomina',
    loadComponent: () =>
      import('./pages/nomina/nomina.component'),
    children: [
      {
        path: '',
        redirectTo: 'constructor-de-calendarios',
        pathMatch: 'full',
      },
      {
        path: 'constructor-de-calendarios',
        title: 'Constructor de calendarios',
        loadComponent: () =>
          import('./pages/work-shift-calendar/work-shift-calendar.component'),
      },
      {
        path: 'control-de-personal',
        title: 'Control del personal',
        loadComponent: () =>
          import('./pages/staff-control/staff-control.component'),
      },
      {
        path: 'historial-del-personal',
        title: 'Historial del personal',
        loadComponent: () =>
          import('./pages/historial-personal/historial-personal.component'),
      },
    ],
  },
];

export default NOMINA_ROUTES;
