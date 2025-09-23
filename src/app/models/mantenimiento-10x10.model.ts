import { Timestamp } from "@angular/fire/firestore";
import { Comentario } from "./comentario-chat.model";
import { ParticipanteChat } from "./participante-chat.model";

export interface Mantenimiento10x10 {
  id?: string | any;
  idSucursal: string | undefined;
  idUsuarioSoporte: string | undefined;
  fecha: Date | undefined;

  mantenimientoCaja: boolean;
  mantenimientoCajaEvidenciaUrl?: string;

  mantenimientoImpresoras: boolean;
  mantenimientoImpresorasEvidenciaUrl?: string;

  mantenimientoRack: boolean;
  mantenimientoRackEvidenciaUrl?: string;

  mantenimientoPuntosVentaTabletas: boolean;
  mantenimientoPuntosVentaTabletasEvidenciaUrl?: string;

  mantenimientoContenidosSistemaCable: boolean;
  mantenimientoContenidosSistemaCableEvidenciaUrl?: string;

  mantenimientoInternet: boolean;
  mantenimientoInternetEvidenciaUrl?: string;

  mantenimientoCCTV: boolean;
  mantenimientoCCTVEvidenciaUrl?: string;

  mantenimientoNoBrakes: boolean;
  mantenimientoNoBrakesEvidenciaUrl?: string;

  mantenimientoTiemposCocina: boolean;
  mantenimientoTiemposCocinaEvidenciaUrl?: string;

  mantenimientoConcentradorApps: boolean;
  mantenimientoConcentradorAppsEvidenciaUrl?: string;

  observaciones: string | undefined;
  estatus: boolean;
  timestamp?: Timestamp | Date;

  comentarios: Comentario[];
  participantesChat: ParticipanteChat[];

}

