import { TipoDispositivo } from './tipo-dispositivo.interface';

/**
 * Catálogo central de tipos de dispositivos por área.
 * Para dar de alta un nuevo tipo (ej. amplificador, impresora, etc.) basta con
 * agregar un elemento a este arreglo sin modificar componentes ni servicios.
 */
export const TIPOS_DISPOSITIVO_CATALOGO: TipoDispositivo[] = [
  {
    id: 'tv',
    nombre: 'TVs',
    nombreSingular: 'TV',
    icono: 'bx bx-tv',
    idArea: '2',
    orden: 1,
    activo: true,
    placeholderNombre: 'Ej. TV Sala Principal',
    placeholderMarca: 'Ej. Samsung, LG, Hisense',
    placeholderModelo: 'Ej. UN55TU7000',
    camposOpcionales: ['marca', 'pulgadas', 'modelo', 'numeroSerie', 'comentarios'],
  },
  {
    id: 'bocina',
    nombre: 'Bocinas',
    nombreSingular: 'Bocina',
    icono: 'bx bx-volume-full',
    idArea: '2',
    orden: 2,
    activo: true,
    placeholderNombre: 'Ej. Bocina Terraza Norte',
    placeholderMarca: 'Ej. JBL, Bose, Yamaha',
    placeholderModelo: 'Ej. Control 25-1',
    camposOpcionales: ['marca', 'modelo', 'numeroSerie', 'comentarios'],
  },
  {
    id: 'tableta',
    nombre: 'Tabletas',
    nombreSingular: 'Tableta',
    icono: 'bx bx-tab',
    idArea: '1',
    orden: 1,
    activo: true,
    placeholderNombre: 'Ej. Tableta Comandas 1',
    placeholderMarca: 'Ej. Samsung, Lenovo, Apple',
    placeholderModelo: 'Ej. Galaxy Tab A9',
    camposOpcionales: ['marca', 'modelo', 'numeroSerie', 'comentarios'],
  },
  {
    id: 'tpv',
    nombre: 'Puntos de Venta (TPV)',
    nombreSingular: 'TPV',
    icono: 'bx bx-desktop',
    idArea: '1',
    orden: 2,
    activo: true,
    placeholderNombre: 'Ej. Caja Principal 1',
    placeholderMarca: 'Ej. Elo, HP, Posiflex',
    placeholderModelo: 'Ej. POS-1500',
    camposOpcionales: ['marca', 'modelo', 'numeroSerie', 'comentarios'],
  },
];

export function obtenerTiposDispositivoPorArea(idArea?: string | number | null): TipoDispositivo[] {
  const areaNormalizada = idArea !== null && idArea !== undefined ? String(idArea).trim() : '';
  return TIPOS_DISPOSITIVO_CATALOGO.filter(
    (tipo) => tipo.activo && (!areaNormalizada || tipo.idArea === areaNormalizada)
  ).sort((a, b) => a.orden - b.orden);
}

export function obtenerTipoDispositivoPorId(tipoId?: string | null): TipoDispositivo | undefined {
  if (!tipoId) return undefined;
  return TIPOS_DISPOSITIVO_CATALOGO.find((tipo) => tipo.id === tipoId);
}
