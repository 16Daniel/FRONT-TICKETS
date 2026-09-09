import { Routes } from '@angular/router';

export const CUPONES_MAIN_ROUTES: Routes = [
  {
    path: 'cupones',
    title: 'Cupones',
    loadComponent: () =>
      import('./pages/cupones-page/cupones-page.component'),
  },
  {
    path: 'validador-api-local',
    title: 'Disponibilidad API Local',
    loadComponent: () =>
      import('./pages/validador-api-local/validador-api-local.component'),
  },
];

export default CUPONES_MAIN_ROUTES;
