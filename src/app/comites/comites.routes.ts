import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

export const COMITES_ROUTES: Routes = [
  {
    path: 'comites',
    canActivate: [permissionGuard(['comites.admin.ver', 'tickets.comites.ver'])],
    children: [
      {
        path: '',
        redirectTo: 'admin',
        pathMatch: 'full',
      },
      {
        path: 'admin',
        title: 'Comites',
        canActivate: [permissionGuard('comites.admin.ver')],
        loadComponent: () =>
          import('./pages/comites-page/comites-page').then((m) => m.ComitesPage),
      },
      {
        path: 'tickets',
        title: 'Tickets por comité',
        canActivate: [permissionGuard('tickets.comites.ver')],
        loadComponent: () =>
          import('./pages/tickets-comites-page/tickets-comites-page').then(
            (m) => m.TicketsComitesPage,
          ),
      },
    ],
  },
];

export default COMITES_ROUTES;
