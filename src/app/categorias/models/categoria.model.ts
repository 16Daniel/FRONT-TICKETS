import { Subcategoria } from "../interfaces/subcategoria.interface";

export class Categoria {
  id: string | any;
  idArea: string | number = '';
  nombre: string = '';
  estimacion?: number;
  eliminado: boolean = false;
  subcategorias: Subcategoria[] = [];
  activarSubcategorias: boolean = false;
  tipo?: 'rama' | 'hoja' = 'rama';
  evidenciaObligatoria?: boolean = false;
  // Urgencia (3×3)
  urgencia?: number;
  criticidad?: number;
  score?: number;
  prioridad?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  // Tiempo de resolución configurado (SLA)
  tiempoResolucion?: number;
  unidadResolucion?: 'm' | 'h' | 'd';
  horasResolucion?: number;
}
