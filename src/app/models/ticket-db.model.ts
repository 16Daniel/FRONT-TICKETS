import { Timestamp } from '@angular/fire/firestore';

export interface TicketDB {
  id: string;
  fecha: Timestamp;
  idsucordpto: string;
  statusSuc: string;
  idproveedor: string;
  idcategoria: number;
  decripcion: string;
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
  nombreCategoria: string | null;
  comentariosfinales: string | null;
  folio: string;
}
