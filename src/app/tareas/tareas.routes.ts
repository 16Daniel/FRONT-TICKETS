import { Routes } from '@angular/router';

export const TAREAS_MAIN_ROUTES: Routes = [
  {
    path: 'tareas',
    title: 'Tareas',
    loadComponent: () =>
      import('./pages/tareas-page/tareas-page.component').then(m => m.TareasPageComponent),
  }
];

export default TAREAS_MAIN_ROUTES;
