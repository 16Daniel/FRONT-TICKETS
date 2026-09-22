import { Routes } from '@angular/router';
import { ResponsableGuard } from '../shared/guards/responsable.guard';

/**
 * Rutas globales (fuera de /main)
 */
export const TAREAS_ROOT_ROUTES: Routes = [
  {
    path: 'tareas/selecciona-responsable',
    title: 'Selecciona quien eres',
    loadComponent: () =>
      import('./pages/seleccionar-responsable-page/seleccionar-responsable-page.component'),
  }
];

export const TAREAS_MAIN_ROUTES: Routes = [
  {
    path: 'tareas',
    title: 'Tareas',
    canActivate: [ResponsableGuard],
    loadComponent: () =>
      import('./pages/tareas-page/tareas-page.component').then(m => m.TareasPageComponent),
  }
];

export default {
  TAREAS_ROOT_ROUTES,
  TAREAS_MAIN_ROUTES
};
