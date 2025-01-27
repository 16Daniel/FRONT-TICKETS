export interface TicketDBH {
  id: string;
  fecha: Date;
  idsucordpto: string;
  statusSuc: string;
  idprov: string;
  idcategoria: string;
  descripcion: string;
  solicitante: string;
  prioridadsuc: string;
  prioridadProv: string | null;
  status: string;
  responsable: string;
  fechafin: Date | null;
  duracion: string | null;
  tiposoporte: string | null;
  iduser: string;
  comentarios: string;
  nombrecategoria: string | null;
}
