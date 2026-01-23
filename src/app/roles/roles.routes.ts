import { Routes } from '@angular/router';

export const ROLES_MAIN_ROUTES: Routes = [
  {
    path: 'roles',
    title: 'Roles de usuarios',
    loadComponent: () =>
      import('./pages/roles-page/roles-pages.component'),
  },
];

export default ROLES_MAIN_ROUTES;
