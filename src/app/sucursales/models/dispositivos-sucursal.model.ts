import { Dispositivo } from '../../mantenimientos/interfaces/dispositivo.model';

export interface DispositivosSucursal {
  id?: string;
  idSucursal: number | string;
  tvs: Dispositivo[];
  bocinas: Dispositivo[];
}
