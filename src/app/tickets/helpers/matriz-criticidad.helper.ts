import { CuadranteInfo } from '../interfaces/cuadrante-info.interface';
import { TiempoSlaCelda } from '../interfaces/tiempo-sla-celda.interface';

export const MATRIZ_FILAS = [
  { impacto: 3, label: '3 · Crítico' },
  { impacto: 2, label: '2 · Moderado' },
  { impacto: 1, label: '1 · Leve' }
];

export const MATRIZ_COLUMNAS = [
  { urgencia: 3, label: '3 · Inmediata' },
  { urgencia: 2, label: '2 · Media' },
  { urgencia: 1, label: '1 · Baja' }
];

export const CUADRANTES: CuadranteInfo[] = [
  {
    key: 'critico',
    min: 7,
    max: 9,
    label: 'Crítico',
    fill: '#EF4444',
    bg: '#FFF1F2',
    text: '#E11D48',
    icon: 'bx-flame',
    desc: 'Impacto alto + urgencia alta. Detiene operación o pone en riesgo personas o activos.'
  },
  {
    key: 'alto',
    min: 5,
    max: 6,
    label: 'Alto',
    fill: '#EA580C',
    bg: '#FFEDD5',
    text: '#C2410C',
    icon: 'bx-error-alt',
    desc: 'Afecta a un equipo o proceso completo sin detener toda la sucursal.'
  },
  {
    key: 'medio',
    min: 3,
    max: 4,
    label: 'Medio',
    fill: '#EAB308',
    bg: '#FEFCE8',
    text: '#CA8A04',
    icon: 'bx-time-five',
    desc: 'Incidencia molesta pero manejable. Entra a la fila normal.'
  },
  {
    key: 'bajo',
    min: 1,
    max: 2,
    label: 'Bajo',
    fill: '#10B981',
    bg: '#F0FDF4',
    text: '#059669',
    icon: 'bx-check-circle',
    desc: 'Cosmético o de mejora. No afecta la operación diaria.'
  }
];

export function calcularScore(impacto: number, urgencia: number): number {
  return (impacto || 2) * (urgencia || 2);
}

export function clasificarCuadrante(score: number): CuadranteInfo {
  const q = CUADRANTES.find((c) => score >= c.min && score <= c.max);
  return q || CUADRANTES[3];
}

/**
 * Tiempos SLA predeterminados por celda (Impacto × Urgencia):
 * [2 d]   [12 h]  [2 h]
 * [4 d]   [1 d]   [8 h]
 * [5 d]   [3 d]   [1.5 d]
 */
export const TIEMPOS_MATRIZ_SLA: Record<string, TiempoSlaCelda> = {
  // Impacto 3 (Crítico)
  '3-1': { horas: 48, label: '2 d' },
  '3-2': { horas: 12, label: '12 h' },
  '3-3': { horas: 2, label: '2 h' },
  // Impacto 2 (Moderado)
  '2-1': { horas: 96, label: '4 d' },
  '2-2': { horas: 24, label: '1 d' },
  '2-3': { horas: 8, label: '8 h' },
  // Impacto 1 (Leve)
  '1-1': { horas: 120, label: '5 d' },
  '1-2': { horas: 72, label: '3 d' },
  '1-3': { horas: 36, label: '1.5 d' }
};

export function obtenerTiempoSla(impacto: number, urgencia: number): TiempoSlaCelda {
  const imp = Math.min(3, Math.max(1, impacto || 2));
  const urg = Math.min(3, Math.max(1, urgencia || 2));
  const key = `${imp}-${urg}`;
  return TIEMPOS_MATRIZ_SLA[key] || { horas: 24, label: '1 d' };
}

