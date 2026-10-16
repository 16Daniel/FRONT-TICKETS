import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'comites',
    children: [
      {
        path: '',
        redirectTo: 'admin',
        pathMatch: 'full',
      },
      {
        path: 'admin',
        title: 'Comites',
        loadComponent: () =>
          import('./pages/comites-page/comites-page').then((m) => m.ComitesPage),
      },
      {
        path: 'tickets',
        title: 'Tickets por comité',
        loadComponent: () =>
          import('./pages/tickets-comites-page/tickets-comites-page').then(
            (m) => m.TicketsComitesPage,
          ),
      },
    ],
  },
];

export default AUTH_ROUTES;
