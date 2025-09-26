import { Timestamp } from "@angular/fire/firestore";
import { Comentario } from "./comentario-chat.model";
import { ParticipanteChat } from "./participante-chat.model";

export interface MantenimientoMtto {
  id?: string | any;
  idSucursal: string | undefined;
  idUsuarioSoporte: string | undefined;
  fecha: Date | undefined;
  idActivoFijo: string;
  descripcion: string;
  referencia: string;

  mantenimientoTermostato: boolean;
  mantenimientoTermostatoEvidenciaUrl?: string;

  mantenimientoPerillas: boolean;
  mantenimientoPerillasEvidenciaUrl?: string;

  mantenimientoTornilleria: boolean;
  mantenimientoTornilleriaEvidenciaUrl?: string;

  mantenimientoRuedas: boolean;
  mantenimientoRuedasEvidenciaUrl?: string;

  mantenimientoCableado: boolean;
  mantenimientoCableadoEvidenciaUrl?: string;

  mantenimientoTina: boolean;
  mantenimientoTinaEvidenciaUrl?: string;

  mantenimientoMangueras: boolean;
  mantenimientoManguerasEvidenciaUrl?: string;

  mantenimientoLlavesDePaso: boolean;
  mantenimientoLlavesDePasoEvidenciaUrl?: string;

  observaciones: string | undefined;
  estatus: boolean;
  timestamp?: Timestamp | Date;

  comentarios: Comentario[];
  participantesChat: ParticipanteChat[];
}
