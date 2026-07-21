import { Timestamp } from "@angular/fire/firestore";
import { Comentario } from "../../shared/interfaces/comentario-chat.model";
import { ParticipanteChat } from "../../shared/interfaces/participante-chat.model";
import { Dispositivo } from "../../activos-fijos/interfaces/dispositivo.interface";

export interface MantenimientoAudioVideo {
  id?: string | any;
  idSucursal: string | undefined;
  idUsuarioSoporte: string | undefined;
  fecha: Date | undefined;

  mantenimientoPantallasSoporte: boolean;
  tvs?: {
    evidenciaUrls?: string[];
    dispositivo: Dispositivo;
  }[];

  mantenimientoSenalVideo: boolean;
  mantenimientoSenalVideoEvidenciaUrls?: string[];

  mantenimientoFuncionalBocinas: boolean;
  bocinas?: {
    dispositivo: Dispositivo;
    evidenciaUrls?: string[];
  }[];

  mantenimientoTransmisionAudio: boolean;
  mantenimientoTransmisionAudioEvidenciaUrls?: string[];

  mantenimientoOrdenamientoCableado: boolean;
  mantenimientoOrdenamientoCableadoEvidenciaUrls?: string[];

  mantenimientoNiveles: boolean;
  mantenimientoNivelesEvidenciaUrls?: string[];

  observaciones: string | undefined;
  estatus: boolean;
  timestamp?: Timestamp | Date;

  comentarios: Comentario[];
  participantesChat: ParticipanteChat[];

}

