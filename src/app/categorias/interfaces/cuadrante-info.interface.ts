export interface CuadranteInfo {
  key: string;
  min: number;
  max: number;
  label: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  fill: string;
  bg: string;
  text: string;
  icon: string;
  desc: string;
}
