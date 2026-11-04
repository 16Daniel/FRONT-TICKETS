import { Rol } from '../interfaces/rol.model';
import {
  GrupoMenuPermiso,
  MenuPermisoItem,
  OpcionRutaInicio,
} from '../interfaces/ruta.model';

/**
 * Opciones de pantallas de inicio configurables por Rol
 */
export const RUTAS_INICIO_DISPONIBLES: OpcionRutaInicio[] = [
  {
    label: 'Inicio Administrador / Jefatura (/main/home-a)',
    value: '/main/home-a',
    descripcion: 'Tablero de gestión global o por jefatura de área',
  },
  {
    label: 'Inicio Sucursal / Corporativo (/main/home)',
    value: '/main/home',
    descripcion: 'Tablero operativo de tickets para sucursales y corporativo',
  },
  {
    label: 'Inicio Analista de Soporte (/main/home-s)',
    value: '/main/home-s',
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

/**
 * Catálogo Maestro de Grupos y Opciones de Menú del sistema
 */
export const GRUPOS_MENU_PERMISOS: GrupoMenuPermiso[] = [
  {
    idGrupo: 'tickets',
    tituloGrupo: 'Tickets',
    iconoGrupo: 'bx bx-receipt',
    descripcionGrupo: 'Operación, seguimiento, tableros e indicadores de tickets de servicio',
    menus: [
      {
        idMenu: 'tickets_inicio_admin',
        titulo: 'Inicio (Administrador)',
        ruta: '/main/home-a',
        icono: 'bx bxs-dashboard',
        permisoVista: 'tickets.inicio_admin.ver',
      },
      {
        idMenu: 'tickets_inicio_sucursal',
        titulo: 'Inicio (Sucursal)',
        ruta: '/main/home',
        icono: 'bx bxs-dashboard',
        permisoVista: 'tickets.inicio_sucursal.ver',
      },
      {
        idMenu: 'tickets_inicio_analista',
        titulo: 'Inicio (Analista)',
        ruta: '/main/home-s',
        icono: 'bx bxs-dashboard',
        permisoVista: 'tickets.inicio_analista.ver',
      },
      {
        idMenu: 'tickets_mis_tickets',
        titulo: 'Mis tickets',
        ruta: '/main/mis-tickets',
        icono: 'bx bx-receipt',
        permisoVista: 'tickets.mis_tickets.ver',
      },
      {
        idMenu: 'tickets_comites',
        titulo: 'Tickets comités',
        ruta: '/main/comites/tickets',
        icono: 'bx bxs-group',
        permisoVista: 'tickets.comites.ver',
      },
      {
        idMenu: 'tickets_kpis',
        titulo: 'KPIs',
        ruta: '/main/kpis',
        icono: 'bx bx-line-chart',
        permisoVista: 'tickets.kpis.ver',
      },
      {
        idMenu: 'tickets_umbral',
        titulo: 'Umbral de Recurrencias',
        ruta: '/main/categorias/umbral-recurrencias',
        icono: 'bx bx-slider',
        permisoVista: 'categorias.umbral.ver',
      },
      {
        idMenu: 'tickets_comites_admin',
        titulo: 'Comités',
        ruta: '/main/comites/admin',
        icono: 'bx bx-group',
        permisoVista: 'comites.admin.ver',
      },
    ],
  },
  {
    idGrupo: 'mantenimientos',
    tituloGrupo: 'Mantenimientos',
    iconoGrupo: 'bx bx-wrench',
    descripcionGrupo: 'Seguimiento de mantenimientos preventivos (8x8 / 6x6), evaluaciones en sucursal y programación de visitas',
    menus: [
      {
        idMenu: 'mantenimientos_admin',
        titulo: 'Mantenimientos (Administrador)',
        ruta: '/main/mantenimientos-administrador',
        icono: 'bx bx-wrench',
        permisoVista: 'mantenimientos.admin.ver',
      },
      {
        idMenu: 'mantenimientos_sucursal',
        titulo: 'Mantenimientos (Sucursal)',
        ruta: '/main/mantenimientos-sucursal',
        icono: 'bx bx-wrench',
        permisoVista: 'mantenimientos.sucursal.ver',
      },
      {
        idMenu: 'mantenimientos_analista',
        titulo: 'Mantenimientos (Analista)',
        ruta: '/main/mantenimientos-analista',
        icono: 'bx bx-wrench',
        permisoVista: 'mantenimientos.analista.ver',
      },
      {
        idMenu: 'operaciones_constructor_visitas',
        titulo: 'Registrar visita',
        ruta: '/main/calendar-builder',
        icono: 'bx bx-calendar-plus',
        permisoVista: 'visitas.constructor.ver',
      },
      {
        idMenu: 'operaciones_calendario_visitas',
        titulo: 'Calendario de visitas',
        ruta: '/main/branch-visit-schedule',
        icono: 'bx bx-calendar',
        permisoVista: 'visitas.calendario.ver',
      },
    ],
  },
  {
    idGrupo: 'versiones',
    tituloGrupo: 'Control de versiones',
    iconoGrupo: 'bx bx-git-repo-forked',
    descripcionGrupo: 'Publicación y bitácora de actualizaciones de la plataforma',
    menus: [
      {
        idMenu: 'versiones_control',
        titulo: 'Control de versiones',
        ruta: '/main/version-control',
        icono: 'bx bx-git-repo-forked',
        permisoVista: 'versiones.control.ver',
      },
    ],
  },
  {
    idGrupo: 'administracion',
    tituloGrupo: 'Gestión y Admin',
    iconoGrupo: 'bx bx-shield-quarter',
    descripcionGrupo: 'Administración de usuarios, roles, sucursales, áreas y catálogos base',
    menus: [
      {
        idMenu: 'admin_usuarios',
        titulo: 'Usuarios',
        ruta: '/main/users',
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
        ruta: '/main/branches',
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
  },
  {
    idGrupo: 'operaciones',
    tituloGrupo: 'Operaciones',
    iconoGrupo: 'bx bx-briefcase-alt-2',
    descripcionGrupo: 'Tareas, activos fijos, compras, comensales, inventario y aceites',
    menus: [
      {
        idMenu: 'operaciones_tareas',
        titulo: 'Tareas',
        ruta: '/main/tareas',
        icono: 'bx bx-check-square',
        permisoVista: 'tareas.ver',
      },
      {
        idMenu: 'operaciones_activos_fijos',
        titulo: 'Activos fijos',
        ruta: '/main/fixed-assets',
        icono: 'bx bx-package',
        permisoVista: 'activos_fijos.ver',
      },
      {
        idMenu: 'operaciones_compras',
        titulo: 'Requisición de compra',
        ruta: '/administracion/compras',
        icono: 'bx bx-shopping-bag',
        permisoVista: 'compras.ver',
      },
      {
        idMenu: 'operaciones_comensales',
        titulo: 'Comensales',
        ruta: '/main/comensales',
        icono: 'bx bx-group',
        permisoVista: 'comensales.ver',
      },
      {
        idMenu: 'operaciones_inventario',
        titulo: 'Inventario',
        ruta: '/inventario/captura',
        icono: 'bx bx-clipboard',
        permisoVista: 'inventario.captura.ver',
      },
      {
        idMenu: 'operaciones_recoleccion_aceite',
        titulo: 'Recolección de aceite',
        ruta: '/cedis/recoleccion',
        icono: 'bx bxs-droplet',
        permisoVista: 'aceites.recoleccion.ver',
      },
      {
        idMenu: 'operaciones_control_aceite',
        titulo: 'Control de aceite',
        ruta: '/main/control-aceite',
        icono: 'bx bx-droplet',
        permisoVista: 'aceites.control.ver',
      },
    ],
  },
  {
    idGrupo: 'nomina',
    tituloGrupo: 'Personal y Nómina',
    iconoGrupo: 'bx bx-id-card',
    descripcionGrupo: 'Control de asistencia, plantilla en sucursal, checadas y reportes',
    menus: [
      {
        idMenu: 'nomina_personal',
        titulo: 'Personal en sucursal',
        ruta: '/nomina/control-de-personal',
        icono: 'bx bx-group',
        permisoVista: 'nomina.personal.ver',
      },
      {
        idMenu: 'nomina_historial',
        titulo: 'Historial del Personal',
        ruta: '/nomina/historial-del-personal',
        icono: 'bx bx-history',
        permisoVista: 'nomina.historial.ver',
      },
      {
        idMenu: 'nomina_checadas',
        titulo: 'Checadas del personal',
        ruta: '/nomina/checadas',
        icono: 'bx bx-fingerprint',
        permisoVista: 'nomina.checadas.ver',
      },
      {
        idMenu: 'nomina_reportes',
        titulo: 'Reportes nómina',
        ruta: '/nomina/reportes',
        icono: 'bx bx-bar-chart-alt-2',
        permisoVista: 'nomina.reportes.ver',
      },
    ],
  },
  {
    idGrupo: 'planeacion',
    tituloGrupo: 'Planeación',
    iconoGrupo: 'bx bx-book-open',
    descripcionGrupo: 'Diccionarios operativos, control de mermas y precios AYC / Delivery',
    menus: [
      {
        idMenu: 'planeacion_diccionario',
        titulo: 'Diccionario',
        ruta: '/planeacion/diccionario',
        icono: 'bx bx-book-open',
        permisoVista: 'planeacion.diccionario.ver',
      },
      {
        idMenu: 'planeacion_mermas',
        titulo: 'Mermas',
        ruta: '/planeacion/mermas',
        icono: 'bx bx-trash',
        permisoVista: 'planeacion.mermas.ver',
      },
      {
        idMenu: 'planeacion_precios_ayc',
        titulo: 'Precios AYC',
        ruta: '/main/precios-ayc',
        icono: 'bx bx-dollar-circle',
        permisoVista: 'planeacion.precios_ayc.ver',
      },
      {
        idMenu: 'planeacion_delivery',
        titulo: 'Diccionario delivery',
        ruta: '/main/diccionario-delivery',
        icono: 'bx bx-book-bookmark',
        permisoVista: 'delivery.diccionario.ver',
      },
    ],
  },
  {
    idGrupo: 'cupones',
    tituloGrupo: 'Cupones y Consumos',
    iconoGrupo: 'bx bx-purchase-tag-alt',
    descripcionGrupo: 'Gestión de promociones, validadores de cupones y consumos',
    menus: [
      {
        idMenu: 'cupones_admin',
        titulo: 'Cupones',
        ruta: '/main/cupones',
        icono: 'bx bx-purchase-tag-alt',
        permisoVista: 'cupones.ver',
      },
      {
        idMenu: 'cupones_validador',
        titulo: 'Validador cupones',
        ruta: 'external:cupones',
        icono: 'bx bx-check-shield',
        permisoVista: 'cupones.validador.ver',
        esAccionExterna: true,
        tipoAccionExterna: 'cupones',
      },
      {
        idMenu: 'consumos_validador',
        titulo: 'Validador consumos',
        ruta: 'external:consumos',
        icono: 'bx bx-receipt',
        permisoVista: 'consumos.validador.ver',
        esAccionExterna: true,
        tipoAccionExterna: 'consumos',
      },
    ],
  },
];

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
    rutaInicio: rol.rutaInicio || '/main/home',
    permisos: [...new Set(permisosBd.filter((p) => menusValidos.has(p)))],
  };
}
