import { Timestamp } from '@angular/fire/firestore';
import { sucursalesComensales } from '../models/sucursales-comensales.model';

export interface itemConteo {
  id: string | undefined;
  fecha: Timestamp;
  nombreSuc: string;
  sucursal: sucursalesComensales;
  mesas: number;
  comensales: number;
  idReg: string;
  turno: string;
}
