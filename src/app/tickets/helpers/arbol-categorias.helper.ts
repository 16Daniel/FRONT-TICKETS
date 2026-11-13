import { Categoria } from '../models/categoria.model';
import { Subcategoria } from '../interfaces/subcategoria.interface';

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
