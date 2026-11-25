import { Dispositivo } from '../../activos-fijos/interfaces/dispositivo.interface';

export interface DispositivosSucursal {
  id?: string;
  idSucursal: number | string;
  tvs: Dispositivo[];
  bocinas: Dispositivo[];
}
