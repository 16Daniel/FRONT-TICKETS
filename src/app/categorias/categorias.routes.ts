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
      import('./pages/umbral-recurrencias-page/umbral-recurrencias-page.component').then(m => m.UmbralRecurrenciasPageComponent),
  }
] as Routes;