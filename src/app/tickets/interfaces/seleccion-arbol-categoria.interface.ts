import { Categoria } from './categoria.mdoel';
import { Subcategoria } from './subcategoria.model';

export interface SeleccionArbolCategoria {
  categoria: Categoria;
  subcategoria?: Subcategoria;
  idCategoria: string;
  idSubcategoria?: string | null;
  nombreCategoria: string;
  nombreSubcategoria?: string | null;
  rutaCompleta: string;
  prioridad?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo' | string;
  score?: number;
}
