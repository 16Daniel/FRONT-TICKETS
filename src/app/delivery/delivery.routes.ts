import { Routes } from '@angular/router';

export const DELIVERY_ROUTES: Routes = [
  {
    path: 'diccionario-delivery',
    loadComponent: () =>
      import('./pages/diccionario-delivery-page/diccionario-delivery-page.component'),
  }
];

export default DELIVERY_ROUTES;
