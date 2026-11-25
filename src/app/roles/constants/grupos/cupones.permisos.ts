import { GrupoMenuPermiso } from '../../interfaces/grupo-menu-permiso.interface';

export const GRUPO_PERMISOS_CUPONES: GrupoMenuPermiso = {
  idGrupo: 'cupones',
  tituloGrupo: 'Cupones y Consumos',
  iconoGrupo: 'bx bx-purchase-tag-alt',
  descripcionGrupo: 'Gestión de promociones, validadores de cupones y consumos',
  menus: [
    {
      idMenu: 'cupones_admin',
      titulo: 'Cupones',
      ruta: '/main/cupones',
      icono: 'bx bx-purchase-tag-alt',
      permisoVista: 'cupones.ver',
    },
    {
      idMenu: 'cupones_validador',
      titulo: 'Validador cupones',
      ruta: 'external:cupones',
      icono: 'bx bx-check-shield',
      permisoVista: 'cupones.validador.ver',
      esAccionExterna: true,
      tipoAccionExterna: 'cupones',
    },
    {
      idMenu: 'consumos_validador',
      titulo: 'Validador consumos',
      ruta: 'external:consumos',
      icono: 'bx bx-receipt',
      permisoVista: 'consumos.validador.ver',
      esAccionExterna: true,
      tipoAccionExterna: 'consumos',
    },
  ],
};
