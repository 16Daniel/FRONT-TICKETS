import { GrupoMenuPermiso } from '../../interfaces/ruta.model';

export const GRUPO_PERMISOS_ADMINISTRACION: GrupoMenuPermiso = {
  idGrupo: 'administracion',
  tituloGrupo: 'Gestión y Admin',
  iconoGrupo: 'bx bx-shield-quarter',
  descripcionGrupo: 'Administración de usuarios, roles, sucursales, áreas y catálogos base',
  menus: [
    {
      idMenu: 'admin_usuarios',
      titulo: 'Usuarios',
      ruta: '/main/usuarios',
      icono: 'bx bx-user',
      permisoVista: 'usuarios.ver',
    },
    {
      idMenu: 'admin_responsables',
      titulo: 'Responsables PIN',
      ruta: '/main/responsables',
      icono: 'bx bx-key',
      permisoVista: 'responsables_pin.ver',
    },
    {
      idMenu: 'admin_roles',
      titulo: 'Roles',
      ruta: '/main/roles',
      icono: 'bx bx-shield-quarter',
      permisoVista: 'roles.ver',
    },
    {
      idMenu: 'admin_sucursales',
      titulo: 'Sucursales',
      ruta: '/main/sucursales',
      icono: 'bx bx-store-alt',
      permisoVista: 'sucursales.ver',
    },
    {
      idMenu: 'admin_areas',
      titulo: 'Áreas',
      ruta: '/main/areas',
      icono: 'bx bx-sitemap',
      permisoVista: 'areas.ver',
    },
    {
      idMenu: 'admin_categorias',
      titulo: 'Categorías',
      ruta: '/main/categorias',
      icono: 'bx bx-grid-alt',
      permisoVista: 'categorias.ver',
      exactMatch: true,
    },
  ],
};
