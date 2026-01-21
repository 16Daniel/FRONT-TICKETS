import { DispositivoTPV } from "../../activos-fijos/interfaces/dispositivo-tpv";

export class Sucursal {
  id?: string | any;
  nombre: string = '';
  activoMantenimientos?: string[] = [];
  eliminado: boolean = false;
  idFront?: number | null;
  controlDeAceite?: boolean | null;
  claUbicacion?: number | number;
  tabletas?: DispositivoTPV[] = [];
  tabletasRequeridas?: number = 0;
  tpvs?: DispositivoTPV[] = [];
  tpvsRequeridos?: number = 0;
}
