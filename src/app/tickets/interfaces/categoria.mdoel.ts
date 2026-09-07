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
  urgencia?: number;
  criticidad?: number;
  score?: number;
  prioridadUrgencia?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  prioridadAtencion?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
}
