import { Timestamp } from "@angular/fire/firestore";

export interface Mantenimiento10x10 {
  idSucursal: number;
  idUsuarioSoporte: number;
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
  observaciones: string;
  timestamp: Timestamp | Date;
}
