export class Area {
  id?: string | any;
  nombre: string = '';
  eliminado: boolean = false;
  activarTickets?: boolean = false;
  horarioTrabajo:any = {};
  horarioGuardia:any = {};
  nivelesNotificacion: EscalationLevel[] = []; 
  gruponotificacion: string = '';
  organigrama: OrganigramaNode[] = [];
}

export interface OrganigramaNode {
  key: string;
  expanded?: boolean;
  data: {
    puesto: string;
    asignados: OrganigramaAsignacion[];
    tipoPersona?: 'usuario' | 'responsable';
    personaId?: string;
    nombre?: string;
  };
  children: OrganigramaNode[];
}

export interface OrganigramaAsignacion {
  id: string;
  tipoPersona: 'usuario' | 'responsable';
  personaId: string;
  nombre: string;
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