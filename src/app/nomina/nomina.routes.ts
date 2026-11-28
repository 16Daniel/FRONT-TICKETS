import { Routes } from '@angular/router';
import { permissionGuard } from '../shared/guards/permission.guard';

export const NOMINA_MAIN_ROUTES: Routes = [
  {
    path: 'constructor-de-calendarios',
    title: 'Constructor de calendarios',
    canActivate: [permissionGuard(['nomina.personal.ver', 'nomina.historial.ver'])],
    loadComponent: () =>
      import('./pages/work-shift-calendar-page/work-shift-calendar-page.component'),
  },
  {
    path: 'control-de-personal',
    title: 'Control del personal',
    canActivate: [permissionGuard('nomina.personal.ver')],
    loadComponent: () =>
      import('./pages/staff-control-page/staff-control-page.component'),
  },
  {
    path: 'historial-del-personal',
    title: 'Historial del personal',
    canActivate: [permissionGuard('nomina.historial.ver')],
    loadComponent: () =>
      import('./pages/historial-personal-page/historial-personal-page.component'),
  },
  {
    path: 'reportes-nomina',
    title: 'Reportes nómina',
    canActivate: [permissionGuard('nomina.reportes.ver')],
    loadComponent: () =>
      import('./pages/reportes-nomina/reportes-nomina'),
  },
  {
    path: 'checadas',
    title: 'Checadas',
    canActivate: [permissionGuard('nomina.checadas.ver')],
    loadComponent: () =>
      import('./pages/checadas-page/checadas-page'),
  },
];

export default NOMINA_MAIN_ROUTES;
