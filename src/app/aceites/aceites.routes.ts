import { Routes } from "@angular/router";

export const ACEITES_ROUTES: Routes = [
  {
    path: 'cedis',
    loadComponent: () => import('./pages/cedis/cedis.component'),
    children: [
      {
        path: '',
        redirectTo: 'recoleccion',
        pathMatch: 'full',
      },
      {
        path: 'recoleccion',
        title: 'Recolección de aceite',
        loadComponent: () =>
          import('./pages/recoleccion-aceite/recoleccion-aceite.component'),
      },
      {
        path: 'control-aceite',
        title: 'Control de aceite',
        loadComponent: () =>
          import('./pages/aceite/aceite.component'),
      },
    ]
  },
  {
    path: 'inventario',
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
          import(
            './pages/captura-inventario-diario/captura-inventario-diario.component'
          ),
      }
    ]
  }
];
