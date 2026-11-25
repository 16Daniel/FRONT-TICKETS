import { GrupoMenuPermiso } from '../../interfaces/ruta.model';

export const GRUPO_PERMISOS_MANTENIMIENTOS: GrupoMenuPermiso = {
  idGrupo: 'mantenimientos',
  tituloGrupo: 'Mantenimientos',
  iconoGrupo: 'bx bx-wrench',
  descripcionGrupo:
    'Seguimiento de mantenimientos preventivos (8x8 / 6x6), evaluaciones en sucursal y programación de visitas',
  menus: [
    {
      idMenu: 'mantenimientos_admin',
      titulo: 'Mantenimientos (Administrador)',
      ruta: '/main/mantenimientos-administrador',
      icono: 'bx bx-wrench',
      permisoVista: 'mantenimientos.admin.ver',
    },
    {
      idMenu: 'mantenimientos_sucursal',
      titulo: 'Mantenimientos (Sucursal)',
      ruta: '/main/mantenimientos-sucursal',
      icono: 'bx bx-wrench',
      permisoVista: 'mantenimientos.sucursal.ver',
    },
    {
      idMenu: 'mantenimientos_analista',
      titulo: 'Mantenimientos (Analista)',
      ruta: '/main/mantenimientos-analista',
      icono: 'bx bx-wrench',
      permisoVista: 'mantenimientos.analista.ver',
    },
    {
      idMenu: 'operaciones_constructor_visitas',
      titulo: 'Registrar visita',
      ruta: '/main/registrar-visita',
      icono: 'bx bx-calendar-plus',
      permisoVista: 'visitas.constructor.ver',
    },
    {
      idMenu: 'operaciones_calendario_visitas',
      titulo: 'Calendario de visitas',
      ruta: '/main/calendario-visitas',
      icono: 'bx bx-calendar',
      permisoVista: 'visitas.calendario.ver',
    },
  ],
};
