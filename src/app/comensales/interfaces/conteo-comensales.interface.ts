import { Timestamp } from '@angular/fire/firestore';
import { sucursalCompetencia } from './sucursal-competencia.interface';
import { sucursalesComensales } from '../models/sucursales-comensales.model';

export interface ConteoComensales {
  id?: string;
  fecha: Timestamp;
  idSucursal: string;
  sucursal: sucursalesComensales;
  competencia: sucursalCompetencia[];
  mesas: number;
  comensales: number;
  turno: number;
}
