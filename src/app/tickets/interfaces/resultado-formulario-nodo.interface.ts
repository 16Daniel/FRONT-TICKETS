export interface ResultadoFormularioNodo {
  nombre: string;
  tipo: 'rama' | 'hoja';
  impacto?: number;
  criticidad?: number;
  urgencia?: number;
  score?: number;
  prioridad?: string;
  prioridadUrgencia?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  prioridadAtencion?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
}

