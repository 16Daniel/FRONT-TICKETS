import { Timestamp } from '@angular/fire/firestore';

export interface Notificacion {
  id?: string | any;
  titulo: string;
  mensaje: string;
  uid: string;
  fecha: Timestamp | any;
  abierta: boolean;
  idtk: string;
  notificado: boolean;
}
