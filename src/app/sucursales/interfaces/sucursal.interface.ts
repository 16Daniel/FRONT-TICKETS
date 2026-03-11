import { Dispositivo } from "../../activos-fijos/interfaces/dispositivo.interface";

export class Sucursal {
  id?: string | any;
  nombre: string = '';
  activoMantenimientos?: string[] = [];
  eliminado: boolean = false;
  idFront?: number | null;
  controlDeAceite?: boolean | null;
  claUbicacion?: number | number;
  tabletas?: Dispositivo[] = [];
  tabletasRequeridas?: number = 0;
  tpvs?: Dispositivo[] = [];
  tpvsRequeridos?: number = 0;
  tvs?: Dispositivo[] = [];
  bocinas?: Dispositivo[] = [];
}
