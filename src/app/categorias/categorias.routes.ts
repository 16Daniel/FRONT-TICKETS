import { Routes } from '@angular/router';

export default [
  {
    path: '',
    title: 'Categorias',
    loadComponent: () =>
      import('./pages/categorias-page/categorias-page.component'),
  }
] as Routes;