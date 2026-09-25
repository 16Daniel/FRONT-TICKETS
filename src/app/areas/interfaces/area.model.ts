export class Area {
  id?: string | any;
  nombre: string = '';
  eliminado: boolean = false;
  activarTickets?: boolean = false;
  horarioTrabajo:any = {};
  horarioGuardia:any = {};
  nivelesNotificacion: EscalationLevel[] = []; 
}

export interface EscalationLevel {
  id: string;
  level: number;
  name: string;
  phone: string;
  role?: string;
}