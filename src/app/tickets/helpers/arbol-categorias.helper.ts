import { Categoria } from '../models/categoria.model';
import { Subcategoria } from '../interfaces/subcategoria.interface';
import { SeleccionArbolCategoria } from '../interfaces/seleccion-arbol-categoria.interface';

export function esNodoRama(nodo: Categoria | Subcategoria | null | undefined): boolean {
  if (!nodo) return false;
  if (nodo.tipo === 'rama') return true;
  return Boolean(
    (nodo.subcategorias && nodo.subcategorias.some((s) => !s.eliminado)) ||
      nodo.activarSubcategorias
  );
}

/**
 * Devuelve los hijos activos de una rama ordenando alfabéticamente únicamente
 * las categorías hoja, manteniendo las subramas en su orden y posición originales.
 */
export function obtenerHijosOrdenadosRama(nodo: Categoria | Subcategoria | null | undefined): Subcategoria[] {
  if (!nodo || !nodo.subcategorias) return [];
  const activos = nodo.subcategorias.filter((s) => !s.eliminado);
  const hojasOrdenadas = activos
    .filter((s) => !esNodoRama(s))
    .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }));

  let indiceHoja = 0;
  return activos.map((s) => (esNodoRama(s) ? s : hojasOrdenadas[indiceHoja++]));
}

export function crearSeleccionArbolCategoria(
  nodo: Categoria | Subcategoria,
  categoriaRaiz: Categoria,
  rutaNombres: string[]
): SeleccionArbolCategoria {
  const esSubcategoria = String(categoriaRaiz.id) !== String(nodo.id);
  const impacto = 'impacto' in nodo && typeof nodo.impacto === 'number'
    ? nodo.impacto
    : undefined;
  const criticidad = nodo.criticidad || impacto || 2;
  const urgencia = nodo.urgencia || 2;
  const tiempoResolucion = nodo.tiempoResolucion || categoriaRaiz.tiempoResolucion;
  const unidadResolucion = nodo.unidadResolucion || categoriaRaiz.unidadResolucion || 'h';

  return {
    categoria: categoriaRaiz,
    subcategoria: esSubcategoria ? nodo as Subcategoria : undefined,
    idCategoria: String(categoriaRaiz.id),
    idSubcategoria: esSubcategoria ? String(nodo.id) : null,
    nombreCategoria: categoriaRaiz.nombre,
    nombreSubcategoria: esSubcategoria ? nodo.nombre : null,
    rutaCompleta: rutaNombres.join(' › '),
    prioridad: nodo.prioridad || 'Medio',
    score: nodo.score || (criticidad * urgencia),
    criticidad,
    urgencia,
    tiempoResolucion,
    unidadResolucion,
    horasResolucion: nodo.horasResolucion || categoriaRaiz.horasResolucion || (
      tiempoResolucion
        ? unidadResolucion === 'm'
          ? Math.round((tiempoResolucion / 60) * 100) / 100
          : unidadResolucion === 'd'
            ? tiempoResolucion * 24
            : tiempoResolucion
        : undefined
    ),
  };
}
