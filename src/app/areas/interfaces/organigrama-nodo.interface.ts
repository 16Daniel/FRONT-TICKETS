export interface OrganigramaNodo {
  key: string;
  id: number;
  nombre: string;
  personaId: string;
  nombreResponsable: string;
  children: OrganigramaNodo[];
}
