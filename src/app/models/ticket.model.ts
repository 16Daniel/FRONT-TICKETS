import { Timestamp } from '@angular/fire/firestore';
import { Comentario } from './comentario-chat.model';
import { ParticipanteChat } from './participante-chat.model';

export interface Ticket {
  id?: string | any;
  idUsuario: string;
  idSucursal: string;
  idProveedor: string;
  idCategoria: string;
  fecha: Timestamp | any;
  fechaEstimacion: Timestamp | any;
  fechaFin: Timestamp | null;
  solicitante: string;
  prioridadSucursal: string;
  prioridadProveedor: string | null;
  responsable: string;
  tipoSoporte: string | null;
  nombreCategoria: string | null;
  decripcion: string;
  comentarios: Comentario[];
  comentariosFinales?: string | null;
  estatusSucursal: string | any;
  estatus: number;
  folio: string;
  calificacion: number;
  participantesChat: ParticipanteChat[];
}
