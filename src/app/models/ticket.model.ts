import { Timestamp } from '@angular/fire/firestore';
import { Comentario } from './comentario-chat.model';
import { ParticipanteChat } from './participante-chat.model';

export interface Ticket {
  id?: string | any;
  idUsuario: string;
  idResponsables: string[]; // Usuarios responsables del ticket
  idSucursal: string;
  idArea: string;
  idCategoria: string;
  idTipoSoporte: string | null;
  idEstatusTicket: string;
  idPrioridadTicket: string;
  fecha: Timestamp | any;
  fechaEstimacion: Timestamp | any;
  fechaFin: Timestamp | null;
  solicitante: string;
  responsable: string;
  nombreCategoria: string | null;
  decripcion: string;
  comentarios: Comentario[];
  comentariosFinales?: string | null;
  folio: string;
  calificacion: number;
  participantesChat: ParticipanteChat[];
}
