import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

export const MANTENIMIENTOS_MAIN_ROUTES: Routes = [
  {
    path: 'mantenimientos-administrador',
    title: 'Mantenimientos (Administrador)',
    canActivate: [permissionGuard('mantenimientos.admin.ver')],
    loadComponent: () =>
      import('./pages/mantenimientos-admin-page/mantenimientos-admin-page.component'),
  },
  {
    path: 'mantenimientos-sucursal',
    title: 'Mantenimientos (Sucursal)',
    canActivate: [permissionGuard('mantenimientos.sucursal.ver')],
    loadComponent: () =>
      import('./pages/mantenimientos-sucursal-page/mantenimientos-sucursal-page.component'),
  },
  {
    path: 'mantenimientos-analista',
    title: 'Mantenimientos (Analista)',
    canActivate: [permissionGuard('mantenimientos.analista.ver')],
    loadComponent: () =>
      import('./pages/mantenimientos-analista-page/mantenimientos-analista-page.component'),
  },
  {
    path: 'calendar-builder',
    title: 'Constructor de calendarios',
    canActivate: [permissionGuard('visitas.constructor.ver')],
    loadComponent: () =>
      import('./pages/constructor-calendario-page/constructor-calendario-page.component'),
  },
  {
    path: 'branch-visit-schedule',
    title: 'Visitas programadas',
    canActivate: [permissionGuard('visitas.calendario.ver')],
    loadComponent: () =>
      import('./pages/branch-visit-schedule-page/branch-visit-schedule-page.component'),
  },
];

export default MANTENIMIENTOS_MAIN_ROUTES;
