import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        title: 'Login',
        loadComponent: () =>
          import('./pages/login/login.component'),
      },
    ],
  },
];

export default AUTH_ROUTES;
