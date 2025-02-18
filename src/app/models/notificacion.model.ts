import { Timestamp } from '@angular/fire/firestore';

export interface Notificacion {
  id?: string | any;
  idTicket: string;
  titulo: string;
  mensaje: string;
  uid: string;
  fecha: Timestamp | any;
  abierta: boolean;
  notificado: boolean;
}
