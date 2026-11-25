import { OpcionRutaInicio } from '../interfaces/opcion-ruta-inicio.interface';

export const RUTA_INICIO_DEFECTO = '/main/home-sucursal';

export const ALIAS_RUTAS_INICIO: Record<string, string> = {
  '/main/home': '/main/home-sucursal',
  '/main/home-s': '/main/home-analista',
  '/main/home-a': '/main/home-admin',
};

/**
 * Opciones de pantallas de inicio configurables por Rol
 */
export const RUTAS_INICIO_DISPONIBLES: OpcionRutaInicio[] = [
  {
    label: 'Inicio Administrador / Jefatura (/main/home-admin)',
    value: '/main/home-admin',
    descripcion: 'Tablero de gestión global o por jefatura de área',
  },
  {
    label: 'Inicio Sucursal / Corporativo (/main/home-sucursal)',
    value: '/main/home-sucursal',
    descripcion: 'Tablero operativo de tickets para sucursales y corporativo',
  },
  {
    label: 'Inicio Analista de Soporte (/main/home-analista)',
    value: '/main/home-analista',
    descripcion: 'Tablero de atención de tickets asignados a soporte',
  },
  {
    label: 'Inicio Especialista (/main/home-specialist)',
    value: '/main/home-specialist',
    descripcion: 'Tablero de tickets asignados a especialistas',
  },
  {
    label: 'Mis Tickets (/main/mis-tickets)',
    value: '/main/mis-tickets',
    descripcion: 'Listado directo de tickets del usuario',
  },
  {
    label: 'Recolección de Aceite CEDIS (/cedis/recoleccion)',
    value: '/cedis/recoleccion',
    descripcion: 'Vista operativa de recolección de aceite para rutas CEDIS',
  },
  {
    label: 'Control de Personal en Sucursal (/nomina/control-de-personal)',
    value: '/nomina/control-de-personal',
    descripcion: 'Tablero de control y bitácora de personal',
  },
];
