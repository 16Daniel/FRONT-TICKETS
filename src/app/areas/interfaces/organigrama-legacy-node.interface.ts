import { OrganigramaLegacyAsignacion } from './organigrama-legacy-asignacion.interface';

export interface OrganigramaLegacyNode {
  key: string;
  data: {
    asignados?: OrganigramaLegacyAsignacion[];
    personaId?: string;
    tipoPersona?: 'usuario' | 'responsable';
    nombre?: string;
    puesto?: string;
  };
  children?: OrganigramaLegacyNode[];
}
