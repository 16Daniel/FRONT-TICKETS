import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

export const TAREAS_MAIN_ROUTES: Routes = [
  {
    path: 'tareas',
    title: 'Tareas',
    canActivate: [permissionGuard('tareas.ver')],
    loadComponent: () =>
      import('./pages/tareas-page/tareas-page.component').then(m => m.TareasPageComponent),
  }
];

export default TAREAS_MAIN_ROUTES;
