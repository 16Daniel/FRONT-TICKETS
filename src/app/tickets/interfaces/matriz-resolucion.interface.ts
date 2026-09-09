import { CeldaMatrizResolucion } from './celda-matriz-resolucion.interface';

export interface MatrizResolucion {
  idArea: string;
  nombreArea?: string;
  celdas: CeldaMatrizResolucion[];
  actualizadoEn?: any;
}

// Alias para retrocompatibilidad
export type MatrizAtencion = MatrizResolucion;
