import { Timestamp } from '@angular/fire/firestore';
import { Comentario } from './comentario-chat.model';
import { ParticipanteChat } from './participante-chat.model';

export interface Ticket {
  id?: string | any;
  idUsuario: string;
  idSucursal: string;
  idArea: string;
  idCategoria: string;
  idTipoSoporte: string | null;
  idEstatusTicket: string;
  fecha: Timestamp | any;
  fechaEstimacion: Timestamp | any;
  fechaFin: Timestamp | null;
  solicitante: string;
  prioridadSucursal: string;
  prioridadArea: string | null;
  responsable: string;
  nombreCategoria: string | null;
  decripcion: string;
  comentarios: Comentario[];
  comentariosFinales?: string | null;
  estatusSucursal: string | any;
  folio: string;
  calificacion: number;
  participantesChat: ParticipanteChat[];
}
