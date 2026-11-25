import { Dispositivo } from "../../mantenimientos/interfaces/dispositivo.model";

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
  imagenesNivelesAudio?: string[] = [];
}
