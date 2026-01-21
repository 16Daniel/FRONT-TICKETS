import { Timestamp } from "@angular/fire/firestore";
import { Comentario } from "../../shared/interfaces/comentario-chat.model";
import { ParticipanteChat } from "../../shared/interfaces/participante-chat.model";

export interface MantenimientoMtto {
  id?: string | any;
  idSucursal: string | undefined;
  idUsuarioSoporte: string | undefined;
  fecha: Date | undefined;
  idActivoFijo: string;
  descripcion: string;
  referencia: string;

  mantenimientoTermostato: boolean;
  mantenimientoTermostatoEvidenciaUrls?: string[];

  mantenimientoPerillas: boolean;
  mantenimientoPerillasEvidenciaUrls?: string[];

  mantenimientoTornilleria: boolean;
  mantenimientoTornilleriaEvidenciaUrls?: string[];

  mantenimientoRuedas: boolean;
  mantenimientoRuedasEvidenciaUrls?: string[];

  mantenimientoCableado: boolean;
  mantenimientoCableadoEvidenciaUrls?: string[];

  mantenimientoTina: boolean;
  mantenimientoTinaEvidenciaUrls?: string[];

  mantenimientoMangueras: boolean;
  mantenimientoManguerasEvidenciaUrls?: string[];

  mantenimientoLlavesDePaso: boolean;
  mantenimientoLlavesDePasoEvidenciaUrls?: string[];

  observaciones: string | undefined;
  estatus: boolean;
  timestamp?: Timestamp | Date;

  comentarios: Comentario[];
  participantesChat: ParticipanteChat[];
}
