import { Timestamp } from '@angular/fire/firestore';

export interface Ticket {
  id?: string | any;
  fecha: Timestamp | any;
  idsucordpto: string;
  statusSuc: string | any;
  idproveedor: string;
  idcategoria: number;
  decripcion: string;// <---
  solicitante: string;
  prioridadsuc: string;
  prioridadProv: string | null;
  status: string;
  responsable: string;
  fechafin: Timestamp | null;
  duracion: string | null;
  tiposoporte: string | null;
  iduser: string;
  comentarios: any[];
  nombreCategoria: string | null; // <--
  comentariosfinales?: string | null;
  folio: string;
  calificacion: number;
}
