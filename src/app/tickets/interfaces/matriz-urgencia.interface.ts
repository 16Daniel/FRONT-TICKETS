import { CeldaMatrizUrgencia } from './celda-matriz-urgencia.interface';

export interface MatrizUrgencia {
  id?: string;
  idArea: string;
  nombreArea?: string;
  celdas: CeldaMatrizUrgencia[];
  actualizadoEn?: any;
  usuarioActualizo?: string;
}
