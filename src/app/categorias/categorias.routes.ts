import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

export default [
  {
    path: '',
    title: 'Categorias',
    canActivate: [permissionGuard('categorias.ver')],
    loadComponent: () =>
      import('./pages/categorias-page/categorias-page.component'),
  },
  {
    path: 'umbral-recurrencias',
    title: 'Umbral de Recurrencias',
    canActivate: [permissionGuard('categorias.umbral.ver')],
    loadComponent: () =>
      import('./pages/umbral-recurrencias-page/umbral-recurrencias-page.component').then(m => m.UmbralRecurrenciasPageComponent),
  }
] as Routes;
