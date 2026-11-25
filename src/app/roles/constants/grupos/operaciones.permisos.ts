import { GrupoMenuPermiso } from '../../interfaces/ruta.model';

export const GRUPO_PERMISOS_OPERACIONES: GrupoMenuPermiso = {
  idGrupo: 'operaciones',
  tituloGrupo: 'Operaciones',
  iconoGrupo: 'bx bx-briefcase-alt-2',
  descripcionGrupo: 'Tareas, activos fijos, compras, comensales, inventario y aceites',
  menus: [
    {
      idMenu: 'operaciones_tareas',
      titulo: 'Tareas',
      ruta: '/main/tareas',
      icono: 'bx bx-check-square',
      permisoVista: 'tareas.ver',
    },
    {
      idMenu: 'operaciones_activos_fijos',
      titulo: 'Activos fijos',
      ruta: '/main/activos-fijos',
      icono: 'bx bx-package',
      permisoVista: 'activos_fijos.ver',
    },
    {
      idMenu: 'operaciones_compras',
      titulo: 'Requisición de compra',
      ruta: '/administracion/compras',
      icono: 'bx bx-shopping-bag',
      permisoVista: 'compras.ver',
    },
    {
      idMenu: 'operaciones_comensales',
      titulo: 'Comensales',
      ruta: '/main/comensales',
      icono: 'bx bx-group',
      permisoVista: 'comensales.ver',
    },
    {
      idMenu: 'operaciones_inventario',
      titulo: 'Inventario',
      ruta: '/inventario/captura',
      icono: 'bx bx-clipboard',
      permisoVista: 'inventario.captura.ver',
    },
    {
      idMenu: 'operaciones_recoleccion_aceite',
      titulo: 'Recolección de aceite',
      ruta: '/cedis/recoleccion',
      icono: 'bx bxs-droplet',
      permisoVista: 'aceites.recoleccion.ver',
    },
    {
      idMenu: 'operaciones_control_aceite',
      titulo: 'Control de aceite',
      ruta: '/main/control-aceite',
      icono: 'bx bx-droplet',
      permisoVista: 'aceites.control.ver',
    },
  ],
};
