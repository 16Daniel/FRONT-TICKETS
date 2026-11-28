import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

export const PLANEACION_MAIN_ROUTES: Routes = [
  {
    path: 'diccionario',
    title: 'Diccionario',
    canActivate: [permissionGuard('planeacion.diccionario.ver')],
    loadComponent: () =>
      import('./pages/diccionario-page/diccionario-page.component'),
  },
  {
    path: 'mermas',
    title: 'Mermas',
    canActivate: [permissionGuard('planeacion.mermas.ver')],
    loadComponent: () =>
      import('./pages/mermas-page/mermas-page.component'),
  },
];

export default PLANEACION_MAIN_ROUTES;
