import { EscalationLevel } from '../interfaces/escalation-level.interface';
import { OrganigramaNode } from '../interfaces/organigrama-node.interface';

export interface AreaNotificationSettings {
  ticketCreado: boolean;
  ticketCerrado: boolean;
  superaTA: boolean;
  superaTR: boolean;
  taPorVencer: boolean;
  trPorVencer: boolean;
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
    taPorVencer: false,
    trPorVencer: false,
  };
  organigrama?: OrganigramaNode[];
}
