import { Timestamp } from '@angular/fire/firestore';
import { Comentario } from './comentario-chat.model';
import { ParticipanteChat } from './participante-chat.model';

export class Ticket {
  id?: string | any;
  idUsuario: string = '';
  idResponsables: string[] = [];
  idSucursal: any = '';
  idArea: string = '';
  idCategoria: string = '';
  idSubcategoria: string | null = null;
  idTipoSoporte: string | null = '';
  idEstatusTicket: string = '1';
  idPrioridadTicket: string = '';
  fecha: Timestamp | any = new Date();
  fechaEstimacion: Timestamp | any;
  fechaFin: Timestamp | null = null;
  solicitante: string = '';
  idResponsableFinaliza: string = '';
  nombreCategoria: string | null = '';
  nombreSubcategoria: string | null = '';
  descripcion: string = '';
  comentarios: Comentario[] = [];
  comentariosFinales?: string | null;
  folio: string = '';
  calificacion: number = 0;
  calificacionAnalista: number = 0;
  participantesChat: ParticipanteChat[] = [];
  validacionAdmin: boolean = false;
  referenciaActivoFijo: string | undefined;
  esAsignadoEspecialista: boolean = false;
  idUsuarioEspecialista: string = '';
}
