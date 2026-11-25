import { MenuPermisoItem } from './menu-permiso-item.interface';

export interface GrupoMenuPermiso {
  idGrupo: string;
  tituloGrupo: string;
  iconoGrupo: string;
  descripcionGrupo: string;
  menus: MenuPermisoItem[];
}
