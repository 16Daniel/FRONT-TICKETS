import { ReglaAreaPermiso, Rol } from '../models/rol.model';
import { MenuPermisoItem } from '../interfaces/menu-permiso-item.interface';
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
 * Normaliza un idArea a string limpio.
 */
export function normalizarIdArea(idArea?: string | number | null): string {
  if (idArea === null || idArea === undefined) return '';
  return String(idArea).trim();
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
 * Limpia y valida el mapa de reglas de área:
 * - Solo conserva reglas de permisos presentes en `permisosPermitidos`.
 * - Descarta reglas con modo inválido o sin áreas seleccionadas.
 * - Normaliza y desduplica `areasIds`.
 */
export function sanearReglasAreaPorPermiso(
  reglas?: Record<string, ReglaAreaPermiso> | null,
  permisosPermitidos?: Iterable<string>
): Record<string, ReglaAreaPermiso> {
  if (!reglas || typeof reglas !== 'object') {
    return {};
  }

  const permitidosSet = permisosPermitidos ? new Set(permisosPermitidos) : null;
  const resultado: Record<string, ReglaAreaPermiso> = {};

  for (const [permiso, regla] of Object.entries(reglas)) {
    if (permitidosSet && !permitidosSet.has(permiso)) continue;
    if (!regla || (regla.modo !== 'SOLO_AREAS' && regla.modo !== 'EXCEPTO_AREAS')) continue;

    const areasLimpias = Array.isArray(regla.areasIds)
      ? [...new Set(regla.areasIds.map((id) => normalizarIdArea(id)).filter((id) => id.length > 0))]
      : [];

    if (areasLimpias.length === 0) continue;

    resultado[permiso] = {
      modo: regla.modo,
      areasIds: areasLimpias,
    };
  }

  return resultado;
}

/**
 * Evalúa si un permiso específico está habilitado para un área dada.
 */
export function evaluarPermisoParaArea(
  permiso: string,
  permisosRol: Set<string>,
  reglasAreaPorPermiso?: Record<string, ReglaAreaPermiso> | null,
  idAreaUsuario?: string | number | null
): boolean {
  if (!permisosRol.has(permiso)) {
    return false;
  }

  const regla = reglasAreaPorPermiso?.[permiso];
  if (!regla || !Array.isArray(regla.areasIds) || regla.areasIds.length === 0) {
    return true;
  }

  const areaUsuario = normalizarIdArea(idAreaUsuario);
  const areasRegla = new Set(regla.areasIds.map((id) => normalizarIdArea(id)).filter(Boolean));

  if (areasRegla.size === 0) {
    return true;
  }

  if (regla.modo === 'SOLO_AREAS') {
    return areaUsuario.length > 0 && areasRegla.has(areaUsuario);
  }

  if (regla.modo === 'EXCEPTO_AREAS') {
    return !areaUsuario || !areasRegla.has(areaUsuario);
  }

  return true;
}

/**
 * Calcula el arreglo de permisos efectivos para un usuario combinando
 * los permisos base de su rol con las reglas opcionales por área.
 */
export function resolverPermisosEfectivos(
  permisosRol?: string[] | null,
  reglasAreaPorPermiso?: Record<string, ReglaAreaPermiso> | null,
  idAreaUsuario?: string | number | null
): string[] {
  const permisosUnicos = Array.isArray(permisosRol) ? [...new Set(permisosRol)] : [];
  if (permisosUnicos.length === 0) {
    return [];
  }

  const permisosSet = new Set<string>(permisosUnicos);
  return permisosUnicos.filter((permiso) =>
    evaluarPermisoParaArea(permiso, permisosSet, reglasAreaPorPermiso, idAreaUsuario)
  );
}

/**
 * Normaliza un documento de Rol leído desde Firestore, respetando estrictamente
 * los permisos y reglas de área guardados en la base de datos.
 */
export function normalizarRolFirestore(rol: Rol): Rol {
  const idStr = String(rol.id ?? '').trim();
  const menusValidos = new Set(obtenerTodosLosPermisosCatalogo());
  const permisosBd = Array.isArray(rol.permisos) ? rol.permisos : [];
  const permisosNormalizados = [...new Set(permisosBd.filter((p) => menusValidos.has(p)))];
  const reglasNormalizadas = sanearReglasAreaPorPermiso(
    rol.reglasAreaPorPermiso,
    permisosNormalizados
  );

  return {
    id: idStr,
    nombre: (rol.nombre || '').trim().toUpperCase(),
    descripcion: (rol.descripcion || '').trim(),
    rutaInicio: normalizarRutaInicio(rol.rutaInicio),
    permisos: permisosNormalizados,
    reglasAreaPorPermiso: reglasNormalizadas,
  };
}
