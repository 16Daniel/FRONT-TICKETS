import { Routes } from '@angular/router';

export const CUPONES_MAIN_ROUTES: Routes = [
  {
    path: 'cupones',
    title: 'Cupones',
    loadComponent: () =>
      import('./pages/cupones-page/cupones-page.component'),
  },
];

export default CUPONES_MAIN_ROUTES;
