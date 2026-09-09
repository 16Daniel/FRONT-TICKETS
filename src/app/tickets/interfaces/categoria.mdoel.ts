import { Subcategoria } from "./subcategoria.model";

export class Categoria {
  id: string | any;
  idArea: string | number = '';
  nombre: string = '';
  estimacion?: number;
  eliminado: boolean = false;
  subcategorias: Subcategoria[] = [];
  activarSubcategorias: boolean = false;
  tipo?: 'rama' | 'hoja' = 'rama';
  // Urgencia (3×3)
  urgencia?: number;
  criticidad?: number;
  score?: number;
  prioridad?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
}
