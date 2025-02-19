import { Timestamp } from "@angular/fire/firestore";

export interface Mantenimiento10x10 {
  id?: string | any;
  idSucursal: string | undefined;
  idUsuarioSoporte: string | undefined;
  fecha: Date | undefined;
  mantenimientoCaja: boolean;
  mantenimientoImpresoras: boolean;
  mantenimientoRack: boolean;
  mantenimientoPuntosVentaTabletas: boolean;
  mantenimientoContenidosSistemaCable: boolean;
  mantenimientoInternet: boolean;
  mantenimientoCCTV: boolean;
  mantenimientoNoBrakes: boolean;
  mantenimientoTiemposCocina: boolean;
  mantenimientoConcentradorApps: boolean;
  observaciones: string | undefined;
  estatus: boolean;
  timestamp?: Timestamp | Date;
}
