import { Timestamp } from "@angular/fire/firestore";

export interface Comentario {
  comentario: string;
  idUsuario: string;
  nombre: string;
  fecha: Timestamp;
}
