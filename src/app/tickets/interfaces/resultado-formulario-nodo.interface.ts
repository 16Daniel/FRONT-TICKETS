export interface ResultadoFormularioNodo {
  nombre: string;
  tipo: 'rama' | 'hoja';
  urgencia?: number;
  score?: number;
  prioridad?: string;
}
