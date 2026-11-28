import { GrupoMenuPermiso } from '../../interfaces/grupo-menu-permiso.interface';

export const GRUPO_PERMISOS_NOMINA: GrupoMenuPermiso = {
  idGrupo: 'nomina',
  tituloGrupo: 'Personal y Nómina',
  iconoGrupo: 'bx bx-id-card',
  descripcionGrupo: 'Control de asistencia, plantilla en sucursal, checadas y reportes',
  menus: [
    {
      idMenu: 'nomina_personal',
      titulo: 'Personal en sucursal',
      ruta: '/main/control-de-personal',
      icono: 'bx bx-group',
      permisoVista: 'nomina.personal.ver',
    },
    {
      idMenu: 'nomina_historial',
      titulo: 'Historial del Personal',
      ruta: '/main/historial-del-personal',
      icono: 'bx bx-history',
      permisoVista: 'nomina.historial.ver',
    },
    {
      idMenu: 'nomina_checadas',
      titulo: 'Checadas del personal',
      ruta: '/main/checadas',
      icono: 'bx bx-fingerprint',
      permisoVista: 'nomina.checadas.ver',
    },
    {
      idMenu: 'nomina_reportes',
      titulo: 'Reportes nómina',
      ruta: '/main/reportes-nomina',
      icono: 'bx bx-bar-chart-alt-2',
      permisoVista: 'nomina.reportes.ver',
    },
  ],
};
