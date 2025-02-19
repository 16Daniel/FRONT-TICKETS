import { Timestamp } from '@angular/fire/firestore';

export interface Ticket {
  id?: string | any;
  idUsuario: string;
  idSucursal: string;
  idProveedor: string;
  idCategoria: string;
  fecha: Timestamp | any;
  fechaEstimacion: Timestamp | any;
  fechaFin: Timestamp | null;
  // duracion: string | null;
  solicitante: string;
  prioridadSucursal: string;
  prioridadProveedor: string | null;
  responsable: string;
  tipoSoporte: string | null;
  nombreCategoria: string | null;
  decripcion: string;
  comentarios: any[];
  comentariosFinales?: string | null;
  estatusSucursal: string | any;
  estatus: number;
  folio: string;
  calificacion: number;
}
