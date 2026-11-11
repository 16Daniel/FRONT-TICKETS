export interface Ruta {
  id: string;
  ruta: string;
  descripcion: string;
  icon: string | null;
}

export interface MenuPermisoItem {
  /** Identificador único del menú */
  idMenu: string;
  /** Título visible en el menú lateral */
  titulo: string;
  /** Ruta de navegación en Angular Router */
  ruta: string;
  /** Clase de ícono Boxicons (ej. 'bx bx-user') */
  icono: string;
  /** Clave del permiso que controla la visibilidad del menú y el acceso a la ruta */
  permisoVista: string;
  /** Indica si requiere coincidencia exacta en routerLinkActive */
  exactMatch?: boolean;
  /** Indica si es un enlace externo o acción especial (ej. validadores locales) */
  esAccionExterna?: boolean;
  /** Tipo de validador externo en caso de aplicar */
  tipoAccionExterna?: 'cupones' | 'consumos';
}

export interface GrupoMenuPermiso {
  idGrupo: string;
  tituloGrupo: string;
  iconoGrupo: string;
  descripcionGrupo: string;
  menus: MenuPermisoItem[];
}

export interface OpcionRutaInicio {
  label: string;
  value: string;
  descripcion: string;
}
