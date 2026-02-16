import { Timestamp } from "@angular/fire/firestore";
import { Comentario } from "../../shared/interfaces/comentario-chat.model";
import { ParticipanteChat } from "../../shared/interfaces/participante-chat.model";

export interface Mantenimiento10x10 {
  id?: string | any;
  idSucursal: string | undefined;
  idUsuarioSoporte: string | undefined;
  fecha: Date | undefined;

  mantenimientoCaja: boolean;
  mantenimientoCajaEvidenciaUrls?: string[];

  mantenimientoImpresoras: boolean;
  mantenimientoImpresorasEvidenciaUrls?: string[];

  mantenimientoRack: boolean;
  mantenimientoRackEvidenciaUrls?: string[];

  mantenimientoPuntosVentaTabletas: boolean;
  mantenimientoPuntosVentaTabletasEvidenciaUrls?: string[];

  mantenimientoContenidosSistemaCable: boolean;
  mantenimientoContenidosSistemaCableEvidenciaUrls?: string[];

  mantenimientoInternet: boolean;
  mantenimientoInternetEvidenciaUrls?: string[];

  mantenimientoCCTV: boolean;
  mantenimientoCCTVEvidenciaUrls?: string[];

  mantenimientoNoBrakes: boolean;
  mantenimientoNoBrakesEvidenciaUrls?: string[];

  mantenimientoTiemposCocina: boolean;
  mantenimientoTiemposCocinaEvidenciaUrls?: string[];

  mantenimientoConcentradorApps: boolean;
  mantenimientoConcentradorAppsEvidenciaUrls?: string[];

  observaciones: string | undefined;
  estatus: boolean;
  timestamp?: Timestamp | Date;

  comentarios: Comentario[];
  participantesChat: ParticipanteChat[];

}

