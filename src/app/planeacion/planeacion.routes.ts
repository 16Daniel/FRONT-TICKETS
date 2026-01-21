import { Routes } from '@angular/router';

export const PLANEACION_ROUTES: Routes = [
  {
    path: 'planeacion',
    loadComponent: () =>
      import('./pages/planeacion/Planeacion.component'),
    children: [
      {
        path: '',
        redirectTo: 'diccionario',
        pathMatch: 'full',
      },
      {
        path: 'diccionario',
        title: 'Diccionario',
        loadComponent: () =>
          import('./pages/Diccionario/Diccionario.component'),
      },
      {
        path: 'mermas',
        title: 'Mermas',
        loadComponent: () =>
          import('./pages/mermas/mermas.component'),
      },
    ],
  },
  {
    path: 'inventario',
    loadComponent: () =>
      import('./pages/stock/stock.component'),
    children: [
      {
        path: '',
        redirectTo: 'captura',
        pathMatch: 'full',
      },
      {
        path: 'captura',
        title: 'Captura de inventario',
        loadComponent: () =>
          import('../aceites/pages/captura-inventario-diario/captura-inventario-diario.component'),
      },
    ],
  },
];

export default PLANEACION_ROUTES;
