export type ModoReglaArea = 'TODAS' | 'SOLO_AREAS' | 'EXCEPTO_AREAS';

export interface ReglaAreaPermiso {
  /**
   * Define cómo se evalúa el área del usuario para este permiso:
   * - SOLO_AREAS: solo pueden verlo usuarios cuyo idArea esté en areasIds.
   * - EXCEPTO_AREAS: pueden verlo todos los usuarios del rol excepto los de areasIds.
   */
  modo: 'SOLO_AREAS' | 'EXCEPTO_AREAS';
  /** Lista de IDs de áreas (colección cat_areas) */
  areasIds: string[];
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;

  /**
   * Ruta a la que se redirige al usuario de este rol al iniciar sesión
   * o cuando intenta acceder a una ruta sin permiso.
   */
  rutaInicio?: string;

  /**
   * Lista de claves de permisos de menú otorgados al rol en Firestore.
   * Ejemplo: ['tickets.inicio.ver', 'usuarios.ver']
   */
  permisos?: string[];

  /**
   * Reglas opcionales de alcance por área, indexadas por clave de permiso (.ver).
   * Si un permiso activo no existe en este mapa, aplica a todas las áreas.
   */
  reglasAreaPorPermiso?: Record<string, ReglaAreaPermiso>;
}
