import { Timestamp } from "@angular/fire/firestore";
import { Comentario } from "./comentario-chat.model";
import { ParticipanteChat } from "./participante-chat.model";

export interface Mantenimiento6x6AV {
  id?: string | any;
  idSucursal: string | undefined;
  idUsuarioSoporte: string | undefined;
  fecha: Date | undefined;

  mantenimientoConexiones: boolean;
  mantenimientoConexionesEvidenciaUrl?: string;

  mantenimientoCableado: boolean;
  mantenimientoCableadoEvidenciaUrl?: string;

  mantenimientoRack: boolean;
  mantenimientoRackEvidenciaUrl?: string;

  mantenimientoControles: boolean;
  mantenimientoControlesEvidenciaUrl?: string;

  mantenimientoNivelAudio: boolean;
  mantenimientoNivelAudioEvidenciaUrl?: string;

  mantenimientoCanales: boolean;
  mantenimientoCanalesEvidenciaUrl?: string;

  observaciones: string | undefined;
  estatus: boolean;
  timestamp?: Timestamp | Date;

  comentarios: Comentario[];
  participantesChat: ParticipanteChat[];
}
