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
  prioridadUrgencia?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo' | string;
  criticidadUrgencia?: number;
  urgenciaUrgencia?: number;
  scoreUrgencia?: number;
  prioridadAtencion?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  criticidadAtencion?: number;
  urgenciaAtencion?: number;
  scoreAtencion?: number;
  score?: number;
  criticidad?: number;
  urgencia?: number;
  scoreGlobal?: number;
}
