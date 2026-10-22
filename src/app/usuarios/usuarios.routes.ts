import { Routes } from '@angular/router';

export const USUARIOS_ROOT_ROUTES: Routes = [
  {
    path: 'usuarios/selecciona-responsable',
    title: 'Selecciona quien eres',
    loadComponent: () =>
      import('./pages/seleccionar-responsable-page/seleccionar-responsable-page.component'),
  },
];

export const USUARIOS_MAIN_ROUTES: Routes = [
  {
    path: 'users',
    title: 'Usuarios',
    loadComponent: () =>
      import('./pages/users-page/users-page.component'),
  },
  {
    path: 'responsables',
    title: 'Responsables',
    loadComponent: () =>
      import('./pages/responsables-page/responsables-page.component'),
  },
];

export default USUARIOS_MAIN_ROUTES;
