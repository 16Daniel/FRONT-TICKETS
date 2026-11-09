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
    path: 'registrar-visita',
    title: 'Registrar visita',
    canActivate: [permissionGuard('visitas.constructor.ver')],
    loadComponent: () =>
      import('./pages/constructor-calendario-page/constructor-calendario-page.component'),
  },
  {
    path: 'calendario-visitas',
    title: 'Calendario de visitas',
    canActivate: [permissionGuard('visitas.calendario.ver')],
    loadComponent: () =>
      import('./pages/calendario-visitas-page/calendario-visitas-page.component'),
  },
];

export default MANTENIMIENTOS_MAIN_ROUTES;
