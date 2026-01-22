import { Routes } from '@angular/router';

export const USUARIOS_MAIN_ROUTES: Routes = [
  {
    path: 'users',
    title: 'Usuarios',
    loadComponent: () =>
      import('./pages/users-page/users-page'),
  },
];

export default USUARIOS_MAIN_ROUTES;
