import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

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
    canActivate: [permissionGuard('usuarios.ver')],
    loadComponent: () =>
      import('./pages/users-page/users-page.component'),
  },
  {
    path: 'responsables',
    title: 'Responsables',
    canActivate: [permissionGuard('responsables_pin.ver')],
    loadComponent: () =>
      import('./pages/responsables-page/responsables-page.component'),
  },
];

export default USUARIOS_MAIN_ROUTES;
