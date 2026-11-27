/**
 * Punto de entrada (barrel) del catálogo de permisos, rutas de inicio y utilidades de roles.
 *
 * Estructura modular:
 * - ./rutas-inicio.constants.ts   -> Rutas de inicio por defecto, alias heredados y opciones disponibles
 * - ./grupos/*.permisos.ts        -> Catálogo de menús y claves de permiso separado por dominio
 * - ../utils/permisos.utils.ts    -> Helpers de normalización y consulta del catálogo
 */
export * from './rutas-inicio.constants';
export * from './grupos';
export * from '../utils/permisos.utils';
