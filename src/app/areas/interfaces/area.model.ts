export class Area {
  id?: string | any;
  nombre: string = '';
  eliminado: boolean = false;
  activarTickets?: boolean = false;
  horarioTrabajo:any = {};
  horarioGuardia:any = {};
  nivelesNotificacion: EscalationLevel[] = []; 
  gruponotificacion: string = '';
}

export interface EscalationLevel {
  id: string;
  level: number;
  responsables: ResponsableNivel[];
  role?: string;
  
}

export interface ResponsableNivel 
{
   id: string;
   name: string;
   phone: string;
   esgrupo: boolean;
}

export interface GrupoWhatsapp {
  id: string;
  name: string;
}