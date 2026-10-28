import { OrganigramaAsignacion } from './organigrama-asignacion.interface';

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
