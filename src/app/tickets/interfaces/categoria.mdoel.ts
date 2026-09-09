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
  criticidadUrgencia?: number;
  urgenciaUrgencia?: number;
  scoreUrgencia?: number;
  prioridadUrgencia?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';

  // Atención (3×3)
  criticidadAtencion?: number;
  urgenciaAtencion?: number;
  scoreAtencion?: number;
  prioridadAtencion?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';

  // Score Global
  scoreGlobal?: number;
}
