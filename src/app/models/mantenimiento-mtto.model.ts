import { Timestamp } from "@angular/fire/firestore";

export interface MantenimientoMtto {
  id?: string | any;
  idSucursal: string | undefined;
  idUsuarioSoporte: string | undefined;
  fecha: Date | undefined;
  idActivoFijo: string;
  descripcion: string;
  mantenimientoTermostato: boolean;
  mantenimientoPerillas: boolean;
  mantenimientoTornilleria: boolean;
  mantenimientoRuedas: boolean;
  mantenimientoCableado: boolean;
  mantenimientoTina: boolean;
  mantenimientoMangueras: boolean;
  mantenimientoLlavesDePaso: boolean;

  observaciones: string | undefined;
  estatus: boolean;
  timestamp?: Timestamp | Date;
}
