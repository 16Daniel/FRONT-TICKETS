import { Routes } from '@angular/router';

export const NOMINA_ROUTES: Routes = [
  {
    path: 'nomina',
    loadComponent: () =>
      import('./pages/nomina-page/nomina-page.component'),
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
          import('./pages/work-shift-calendar-page/work-shift-calendar-page.component'),
      },
      {
        path: 'control-de-personal',
        title: 'Control del personal',
        loadComponent: () =>
          import('./pages/staff-control-page/staff-control-page.component'),
      },
      {
        path: 'historial-del-personal',
        title: 'Historial del personal',
        loadComponent: () =>
          import('./pages/historial-personal-page/historial-personal-page.component'),
      },
        {
        path: 'checadas',
        title: 'Checadas',
        loadComponent: () =>
          import('./pages/checadas-page/checadas-page'),
      },
    ],
  },
];

export default NOMINA_ROUTES;
