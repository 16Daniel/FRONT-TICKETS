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
          import('./layout/pagos-tabs/pagos-tabs.component'),
      },
    ],
  },
];

export default PAGOS_ROUTES;
