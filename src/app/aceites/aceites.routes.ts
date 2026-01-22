import { Routes } from '@angular/router';

/**
 * Rutas que viven dentro de /main
 * Ej:
 * /main/kpis
 */
export const ACEITES_MAIN_ROUTES: Routes = [
  {
    path: 'kpis',
    title: 'KPIS',
    loadComponent: () =>
      import('./layout/admin-reports-tab/admin-reports-tab.component'),
  },
];

/**
 * Rutas globales (fuera de /main)
 * Ej:
 * /cedis
 * /inventario
 */
export const ACEITES_ROOT_ROUTES: Routes = [
  {
    path: 'cedis',
    loadComponent: () =>
      import('./pages/cedis-page/cedis-page.component'),
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
          import('./pages/recoleccion-aceite-page/recoleccion-aceite-page.component'),
      },
      {
        path: 'control-aceite',
        title: 'Control de aceite',
        loadComponent: () =>
          import('./pages/aceite-page/aceite-page.component'),
      },
    ],
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
          import('./pages/captura-inventario-diario-page/captura-inventario-diario-page.component'),
      },
    ],
  },
];

export default {
  ACEITES_MAIN_ROUTES,
  ACEITES_ROOT_ROUTES,
};
