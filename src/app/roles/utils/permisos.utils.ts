import { Rol } from '../interfaces/rol.model';
import { MenuPermisoItem } from '../interfaces/ruta.model';
import { GRUPOS_MENU_PERMISOS } from '../constants/grupos';
import { ALIAS_RUTAS_INICIO, RUTA_INICIO_DEFECTO } from '../constants/rutas-inicio.constants';

/**
 * Normaliza rutas de inicio heredadas (ej. /main/home, /main/home-s, /main/home-a)
 * hacia sus rutas descriptivas actuales.
 */
export function normalizarRutaInicio(ruta?: string | null): string {
  const limpia = (ruta || '').trim();
  if (!limpia) return RUTA_INICIO_DEFECTO;
  return ALIAS_RUTAS_INICIO[limpia] || limpia;
}

/**
 * Obtiene todos los ítems de menú en una lista plana
 */
export function obtenerTodosLosMenusCatalogo(): MenuPermisoItem[] {
  return GRUPOS_MENU_PERMISOS.reduce((acc, g) => acc.concat(g.menus), [] as MenuPermisoItem[]);
}

/**
 * Obtiene la lista plana de todas las claves de permisos de menú (.ver)
 */
export function obtenerTodosLosPermisosCatalogo(): string[] {
  return obtenerTodosLosMenusCatalogo().map((m) => m.permisoVista);
}

/**
 * Normaliza un documento de Rol leído desde Firestore, respetando estrictamente
 * los permisos que estén guardados en la base de datos (sin pre-cargar permisos desde código).
 */
export function normalizarRolFirestore(rol: Rol): Rol {
  const idStr = String(rol.id ?? '').trim();
  const menusValidos = new Set(obtenerTodosLosPermisosCatalogo());
  const permisosBd = Array.isArray(rol.permisos) ? rol.permisos : [];

  return {
    id: idStr,
    nombre: (rol.nombre || '').trim().toUpperCase(),
    descripcion: (rol.descripcion || '').trim(),
    rutaInicio: normalizarRutaInicio(rol.rutaInicio),
    permisos: [...new Set(permisosBd.filter((p) => menusValidos.has(p)))],
  };
}
