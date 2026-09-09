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

  // Resolución (3×3)
  criticidadResolucion?: number;
  urgenciaResolucion?: number;
  scoreResolucion?: number;
  prioridadResolucion?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';

  // Atención (3×3) [Compatibilidad]
  criticidadAtencion?: number;
  urgenciaAtencion?: number;
  scoreAtencion?: number;
  prioridadAtencion?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';

  // Global
  scoreGlobal?: number;
}

