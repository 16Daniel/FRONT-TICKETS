export interface ResultadoFormularioNodo {
  nombre: string;
  tipo: 'rama' | 'hoja';
  impacto?: number;
  criticidad?: number;
  urgencia?: number;
  score?: number;
  prioridad?: string;

  // Urgencia (3×3)
  criticidadUrgencia?: number;
  urgenciaUrgencia?: number;
  scoreUrgencia?: number;
  prioridadUrgencia?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';

  // Atención (3×3)
  criticidadAtencion?: number;
  urgenciaAtencion?: number;
  scoreAtencion?: number;
  prioridadAtencion?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';

  // Global
  scoreGlobal?: number;
}

