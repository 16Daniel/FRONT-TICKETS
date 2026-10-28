import { EscalationLevel } from './escalation-level.interface';
import { OrganigramaNode } from './organigrama-node.interface';

export class Area {
  id?: string | any;
  nombre: string = '';
  eliminado: boolean = false;
  activarTickets?: boolean = false;
  horarioTrabajo: any = {};
  horarioGuardia: any = {};
  nivelesNotificacion: EscalationLevel[] = [];
  gruponotificacion: string = '';
  organigrama?: OrganigramaNode[];
}
