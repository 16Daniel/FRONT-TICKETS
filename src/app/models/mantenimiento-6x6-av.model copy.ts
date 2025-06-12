import { Timestamp } from "@angular/fire/firestore";

export interface Mantenimiento6x6AV {
  id?: string | any;
  idSucursal: string | undefined;
  idUsuarioSoporte: string | undefined;
  fecha: Date | undefined;

  mantenimientoConexiones: boolean;
  mantenimientoCableado: boolean;
  mantenimientoRack: boolean;
  mantenimientoControles: boolean;
  mantenimientoNivelAudio: boolean;
  mantenimientoCanales: boolean;

  observaciones: string | undefined;
  estatus: boolean;
  timestamp?: Timestamp | Date;
}
