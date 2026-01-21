import { Routes } from '@angular/router';
import { HomeGuard } from '../shared/guards/home.guard';

export const TICKETS_ROUTES: Routes = [
  {
    path: 'home',
    title: 'Inicio',
    loadComponent: () =>
      import('./pages/branch-home-page/branch-home-page'),
    canActivate: [HomeGuard],
  },
  {
    path: 'home-s',
    title: 'Inicio',
    loadComponent: () =>
      import('./pages/analyst-home-page/analyst-home-page'),
    canActivate: [HomeGuard],
  },
  {
    path: 'home-a',
    title: 'Inicio',
    loadComponent: () =>
      import('./pages/admin-home-page/admin-home-page'),
    canActivate: [HomeGuard],
  },
  {
    path: 'home-specialist',
    title: 'Inicio',
    loadComponent: () =>
      import('./pages/specialist-home-page/specialist-home-page'),
    canActivate: [HomeGuard],
  },
  {
    path: 'categories',
    title: 'Categorias',
    loadComponent: () =>
      import('./pages/categories-pages/categories-page'),
  }
];

export default TICKETS_ROUTES;
