export interface AreaOrganigrama {
  areaId: string;
  raiz: OrganigramaNodo;
}

export interface OrganigramaNodo {
  key: string;
  id: number;
  nombre: string;
  personaId: string;
  nombreResponsable: string;
  children: OrganigramaNodo[];
}

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

export interface OrganigramaLegacyAsignacion {
  id?: string;
  tipoPersona?: 'usuario' | 'responsable';
  personaId?: string;
  nombre?: string;
}
