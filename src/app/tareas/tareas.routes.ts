import { Routes } from '@angular/router';

/**
 * Rutas globales (fuera de /main)
 */
export const TAREAS_ROUTES: Routes = [
  {
    path: 'tareas/selecciona-responsable',
    title: 'Selecciona quien eres',
    loadComponent: () =>
      import('./pages/seleccionar-responsable-page/seleccionar-responsable-page.component'),
  },
];

export default TAREAS_ROUTES;
