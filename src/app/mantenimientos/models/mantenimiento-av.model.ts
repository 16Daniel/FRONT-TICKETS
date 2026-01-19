import { Timestamp } from "@angular/fire/firestore";
import { Comentario } from "./comentario-chat.model";
import { ParticipanteChat } from "./participante-chat.model";

export interface Mantenimiento6x6AV {
  id?: string | any;
  idSucursal: string | undefined;
  idUsuarioSoporte: string | undefined;
  fecha: Date | undefined;

  mantenimientoConexiones: boolean;
  mantenimientoConexionesEvidenciaUrls?: string[];

  mantenimientoCableado: boolean;
  mantenimientoCableadoEvidenciaUrls?: string[];

  mantenimientoRack: boolean;
  mantenimientoRackEvidenciaUrls?: string[];

  mantenimientoControles: boolean;
  mantenimientoControlesEvidenciaUrls?: string[];

  mantenimientoNivelAudio: boolean;
  mantenimientoNivelAudioEvidenciaUrls?: string[];

  mantenimientoCanales: boolean;
  mantenimientoCanalesEvidenciaUrls?: string[];

  observaciones: string | undefined;
  estatus: boolean;
  timestamp?: Timestamp | Date;

  comentarios: Comentario[];
  participantesChat: ParticipanteChat[];
}
