import { Timestamp } from '@angular/fire/firestore';

export interface NotificacionDB {
  id: string;
  titulo: string;
  mensaje: string;
  uid: string;
  fecha: Timestamp;
  abierta: boolean;
  idtk: string;
  notificado: boolean;
}
