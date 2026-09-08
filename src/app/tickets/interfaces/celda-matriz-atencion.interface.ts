export interface CeldaMatrizAtencion {
  impacto: number; // 1 (Leve), 2 (Moderado), 3 (Crítico)
  urgencia: number; // 1 (Baja), 2 (Media), 3 (Inmediata)
  valor: number; // Valor numérico ingresado (ej. 12, 2, 1.5, 5)
  unidad: 'h' | 'd'; // 'h' (horas) o 'd' (días)
  horas: number; // Horas totales calculadas para el SLA
  label: string; // Etiqueta visual (ej. "12 h", "2 d", "1.5 d")
  score: number; // impacto * urgencia (1 a 9)
  prioridad: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  posicion?: string; // Compatibilidad legacy opcional
}
