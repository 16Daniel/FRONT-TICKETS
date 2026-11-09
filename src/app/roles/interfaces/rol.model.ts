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
}
