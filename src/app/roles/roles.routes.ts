import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

export const ROLES_MAIN_ROUTES: Routes = [
  {
    path: 'roles',
    title: 'Roles de usuarios',
    canActivate: [permissionGuard('roles.ver')],
    loadComponent: () =>
      import('./pages/roles-page/roles-pages.component'),
  },
];

export default ROLES_MAIN_ROUTES;
