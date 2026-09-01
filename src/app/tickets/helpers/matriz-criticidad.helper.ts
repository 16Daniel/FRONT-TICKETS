import { CuadranteInfo } from '../interfaces/cuadrante-info.interface';

export const MATRIZ_FILAS = [
  { impacto: 3, label: '3 · Crítico' },
  { impacto: 2, label: '2 · Moderado' },
  { impacto: 1, label: '1 · Leve' }
];

export const MATRIZ_COLUMNAS = [
  { urgencia: 1, label: '1 · Baja' },
  { urgencia: 2, label: '2 · Media' },
  { urgencia: 3, label: '3 · Inmediata' }
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
    desc: 'Impacto alto + urgencia alta. Detiene operación o pone en riesgo personas o activos.',
    slaMin: 2,
    slaMax: 2
  },
  {
    key: 'alto',
    min: 5,
    max: 6,
    label: 'Alto',
    fill: '#F59E0B',
    bg: '#FFFBEB',
    text: '#D97706',
    icon: 'bx-error-alt',
    desc: 'Afecta a un equipo o proceso completo sin detener toda la sucursal.',
    slaMin: 8,
    slaMax: 12
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
    desc: 'Incidencia molesta pero manejable. Entra a la fila normal.',
    slaMin: 24,
    slaMax: 48
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
    desc: 'Cosmético o de mejora. No afecta la operación diaria.',
    slaMin: 72,
    slaMax: 120
  }
];

export function calcularScore(impacto: number, urgencia: number): number {
  return (impacto || 2) * (urgencia || 2);
}

export function clasificarCuadrante(score: number): CuadranteInfo {
  const q = CUADRANTES.find((c) => score >= c.min && score <= c.max);
  return q || CUADRANTES[3];
}
