export interface CeldaMatrizAtencion {
  posicion: 'arriba-izquierda' | 'arriba-derecha' | 'abajo-izquierda' | 'abajo-derecha';
  prioridad: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  valor: number;
  unidad: 'h' | 'd';
  horas: number;
  label: string;
}
