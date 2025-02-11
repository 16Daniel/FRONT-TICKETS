export interface Ticket {
  fecha: Date;
  idsucordpto: number;
  statusSuc: string | null;
  idproveedor: string;
  idcategoria: number;
  decripcion: string;
  solicitante: string;
  prioridadsuc: string;
  prioridadProv: string | null;
  status: string;
  responsable: string;
  comentarios: any[];
  fechafin: Date | null;
  duracion: string | null;
  tiposoporte: string | null;
  iduser: string;
  nombreCategoria: string;
  folio: string;
  calificacion: number;
}
