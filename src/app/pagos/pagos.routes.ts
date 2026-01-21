import { Routes } from '@angular/router';

export const PAGOS_ROUTES: Routes = [
  {
    path: 'administracion',
    children: [
      {
        path: '',
        redirectTo: 'compras',
        pathMatch: 'full',
      },
      {
        path: 'compras',
        title: 'Compras',
        loadComponent: () =>
          import('./pages/pagos-tabs/pagos-tabs.component'),
      },
    ],
  },
];

export default PAGOS_ROUTES;
