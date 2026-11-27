import { GrupoMenuPermiso } from '../../interfaces/grupo-menu-permiso.interface';
import { GRUPO_PERMISOS_ADMINISTRACION } from './administracion.permisos';
import { GRUPO_PERMISOS_CUPONES } from './cupones.permisos';
import { GRUPO_PERMISOS_MANTENIMIENTOS } from './mantenimientos.permisos';
import { GRUPO_PERMISOS_NOMINA } from './nomina.permisos';
import { GRUPO_PERMISOS_OPERACIONES } from './operaciones.permisos';
import { GRUPO_PERMISOS_PLANEACION } from './planeacion.permisos';
import { GRUPO_PERMISOS_TICKETS } from './tickets.permisos';

export {
  GRUPO_PERMISOS_TICKETS,
  GRUPO_PERMISOS_MANTENIMIENTOS,
  GRUPO_PERMISOS_ADMINISTRACION,
  GRUPO_PERMISOS_OPERACIONES,
  GRUPO_PERMISOS_NOMINA,
  GRUPO_PERMISOS_PLANEACION,
  GRUPO_PERMISOS_CUPONES,
};

/**
 * Catálogo Maestro de Grupos y Opciones de Menú del sistema.
 * El orden de este arreglo define el orden en el menú lateral y en el editor de roles.
 */
export const GRUPOS_MENU_PERMISOS: GrupoMenuPermiso[] = [
  GRUPO_PERMISOS_TICKETS,
  GRUPO_PERMISOS_MANTENIMIENTOS,
  GRUPO_PERMISOS_ADMINISTRACION,
  GRUPO_PERMISOS_OPERACIONES,
  GRUPO_PERMISOS_NOMINA,
  GRUPO_PERMISOS_PLANEACION,
  GRUPO_PERMISOS_CUPONES,
];
