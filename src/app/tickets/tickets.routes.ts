import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

export const TICKETS_ROUTES: Routes = [
  {
    path: 'home-sucursal',
    title: 'Inicio',
    loadComponent: () =>
      import('./pages/sucursal-home-page/sucursal-home-page'),
    canActivate: [permissionGuard('tickets.inicio_sucursal.ver')],
  },
  {
    path: 'home-analista',
    title: 'Inicio',
    loadComponent: () =>
      import('./pages/analista-home-page/analista-home-page'),
    canActivate: [permissionGuard('tickets.inicio_analista.ver')],
  },
  {
    path: 'home-admin',
    title: 'Inicio',
    loadComponent: () =>
      import('./pages/admin-home-page/admin-home-page'),
    canActivate: [permissionGuard('tickets.inicio_admin.ver')],
  },
  {
    path: 'home-specialist',
    title: 'Inicio',
    loadComponent: () =>
      import('./pages/specialist-home-page/specialist-home-page'),
    canActivate: [permissionGuard(['tickets.inicio_analista.ver', 'tickets.inicio_admin.ver'])],
  },
  {
    path: 'no-conformidad',
    title: 'No conformidad',
    loadComponent: () =>
      import('../compras/components/tabla-devoluciones/tabla-devoluciones'),
    canActivate: [permissionGuard(['compras.ver', 'tickets.mis_tickets.ver'])],
  },
  {
    path: 'kpis',
    title: 'KPIs',
    loadComponent: () =>
      import('./pages/kpis-tickets-page/kpis-tickets-page.component'),
    canActivate: [permissionGuard('tickets.kpis.ver')],
  },
  {
    path: 'mis-tickets',
    title: 'Mis Tickets',
    loadComponent: () =>
      import('./pages/mis-tickets-page/mis-tickets-page'),
    canActivate: [permissionGuard('tickets.mis_tickets.ver')],
  }
];

export default TICKETS_ROUTES;
