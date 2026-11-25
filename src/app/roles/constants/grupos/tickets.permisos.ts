import { GrupoMenuPermiso } from '../../interfaces/ruta.model';

export const GRUPO_PERMISOS_TICKETS: GrupoMenuPermiso = {
  idGrupo: 'tickets',
  tituloGrupo: 'Tickets',
  iconoGrupo: 'bx bx-receipt',
  descripcionGrupo: 'Operación, seguimiento, tableros e indicadores de tickets de servicio',
  menus: [
    {
      idMenu: 'tickets_inicio_admin',
      titulo: 'Inicio (Administrador)',
      ruta: '/main/home-admin',
      icono: 'bx bxs-dashboard',
      permisoVista: 'tickets.inicio_admin.ver',
    },
    {
      idMenu: 'tickets_inicio_sucursal',
      titulo: 'Inicio (Sucursal)',
      ruta: '/main/home-sucursal',
      icono: 'bx bxs-dashboard',
      permisoVista: 'tickets.inicio_sucursal.ver',
    },
    {
      idMenu: 'tickets_inicio_analista',
      titulo: 'Inicio (Analista)',
      ruta: '/main/home-analista',
      icono: 'bx bxs-dashboard',
      permisoVista: 'tickets.inicio_analista.ver',
    },
    {
      idMenu: 'tickets_mis_tickets',
      titulo: 'Mis tickets',
      ruta: '/main/mis-tickets',
      icono: 'bx bx-receipt',
      permisoVista: 'tickets.mis_tickets.ver',
    },
    {
      idMenu: 'tickets_comites',
      titulo: 'Tickets comités',
      ruta: '/main/comites/tickets',
      icono: 'bx bxs-group',
      permisoVista: 'tickets.comites.ver',
    },
    {
      idMenu: 'tickets_kpis',
      titulo: 'KPIs',
      ruta: '/main/kpis',
      icono: 'bx bx-line-chart',
      permisoVista: 'tickets.kpis.ver',
    },
    {
      idMenu: 'tickets_umbral',
      titulo: 'Umbral de Recurrencias',
      ruta: '/main/categorias/umbral-recurrencias',
      icono: 'bx bx-slider',
      permisoVista: 'categorias.umbral.ver',
    },
    {
      idMenu: 'tickets_comites_admin',
      titulo: 'Comités',
      ruta: '/main/comites/admin',
      icono: 'bx bx-group',
      permisoVista: 'comites.admin.ver',
    },
  ],
};
