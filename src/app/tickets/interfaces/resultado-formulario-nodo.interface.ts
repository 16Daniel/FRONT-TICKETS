export interface ResultadoFormularioNodo {
  nombre: string;
  tipo: 'rama' | 'hoja';
  impacto?: number;
  criticidad?: number;
  urgencia?: number;
  score?: number;
  prioridad?: string;
  tiempoResolucion?: number;
  unidadResolucion?: 'm' | 'h' | 'd';
  horasResolucion?: number;


}
