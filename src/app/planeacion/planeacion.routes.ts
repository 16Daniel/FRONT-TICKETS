import { Routes } from '@angular/router';

export const PLANEACION_ROUTES: Routes = [
  {
    path: 'planeacion',
    loadComponent: () =>
      import('./pages/planeacion-page/planeacion-page.component'),
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
          import('./pages/diccionario-page/diccionario-page.component'),
      },
      {
        path: 'mermas',
        title: 'Mermas',
        loadComponent: () =>
          import('./pages/mermas-page/mermas-page.component'),
      },
    ],
  },
  {
    path: 'inventario',
    loadComponent: () =>
      import('./pages/stock-page/stock-page.component'),
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
