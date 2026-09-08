import { Timestamp } from '@angular/fire/firestore';
import { Comentario } from '../../shared/interfaces/comentario-chat.model';
import { ParticipanteChat } from '../../shared/interfaces/participante-chat.model';

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
  // --- MATRIZ DE URGENCIA (3×3) ---
  criticidadUrgencia?: number;
  urgenciaUrgencia?: number;
  scoreUrgencia?: number;
  prioridadUrgencia?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';

  // --- MATRIZ DE ATENCIÓN (3×3) ---
  criticidadAtencion?: number;
  urgenciaAtencion?: number;
  scoreAtencion?: number;
  prioridadAtencion?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';

  // --- SCORE GLOBAL MAESTRO ---
  scoreGlobal?: number; // scoreUrgencia + scoreAtencion (2 a 18)

  idPrioridadTicket?: string; // se quitara
  fecha: Timestamp | any = new Date();
  fechaFin: Timestamp | null = null;
  solicitante: string = '';
  idResponsableFinaliza: string = '';
  nombreCategoria: string | null = '';
  nombreSubcategoria: string | null = '';
  descripcion: string = '';
  comentarios: Comentario[] = [];
  imagenesEvidencia: string[] = [];
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
