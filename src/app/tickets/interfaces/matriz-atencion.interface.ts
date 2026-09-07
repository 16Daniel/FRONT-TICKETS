import { CeldaMatrizAtencion } from './celda-matriz-atencion.interface';

export interface MatrizAtencion {
  idArea: string;
  nombreArea?: string;
  celdas: CeldaMatrizAtencion[];
  actualizadoEn?: any;
}
