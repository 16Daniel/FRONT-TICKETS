import { Routes } from '@angular/router';

export default [
  {
    path: '',
    title: 'Categorias',
    loadComponent: () =>
      import('./pages/categorias-page/categorias-page.component'),
  },
  {
    path: 'umbral-recurrencias',
    title: 'Umbral de Recurrencias',
    loadComponent: () =>
      import('./pages/umbral-recurrencias/umbral-recurrencias.component').then(m => m.UmbralRecurrenciasComponent),
  }
] as Routes;