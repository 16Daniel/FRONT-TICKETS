import { Timestamp } from '@angular/fire/firestore';

export interface Ticket {
  id?: string | any;
  idUsuario: string;
  idSucursal: number;
  idProveedor: number;
  idCategoria: number;
  fecha: Timestamp | any;
  fechaFin: Timestamp | null;
  duracion: string | null;
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
