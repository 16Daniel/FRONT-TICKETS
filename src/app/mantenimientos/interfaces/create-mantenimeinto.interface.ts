import { ParticipanteChat } from "../../shared/interfaces/participante-chat.model";

export interface CreateMantenimientoDto {
  idSucursal: string;
  idUsuario: string;
  fecha: Date;
  participantesChat: ParticipanteChat[];

  // AV
  tvs?: any[];
  bocinas?: any[];

  // MTTO
  idActivoFijo?: string;
  descripcion?: string;
  referencia?: string;
}
