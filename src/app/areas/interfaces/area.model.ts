import { EscalationLevel } from './escalation-level.interface';
import { OrganigramaNode } from './organigrama-node.interface';

export interface AreaNotificationSettings {
  ticketCreado: boolean;
  ticketCerrado: boolean;
  superaTA: boolean;
  superaTR: boolean;
}

export class Area {
  id?: string | any;
  nombre: string = '';
  eliminado: boolean = false;
  activarTickets?: boolean = false;
  horarioTrabajo: any = {};
  horarioGuardia: any = {};
  nivelesNotificacion: EscalationLevel[] = [];
  gruponotificacion: string = '';
  notificacionesTicket: AreaNotificationSettings = {
    ticketCreado: false,
    ticketCerrado: false,
    superaTA: false,
    superaTR: false,
  };
  organigrama?: OrganigramaNode[];
}
