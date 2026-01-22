import { Routes } from '@angular/router';

export const ROLES_MAIN_ROUTES: Routes = [
  {
    path: 'roles',
    title: 'Roles de usuarios',
    loadComponent: () =>
      import('./pages/roles/roles.component'),
  },
];

export default ROLES_MAIN_ROUTES;
