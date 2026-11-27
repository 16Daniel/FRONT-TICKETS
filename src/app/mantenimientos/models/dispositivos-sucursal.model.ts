import { Dispositivo } from '../interfaces/dispositivo.model';

export interface DispositivosSucursal {
  id?: string;
  idSucursal: string;
  dispositivos: Dispositivo[];
}
