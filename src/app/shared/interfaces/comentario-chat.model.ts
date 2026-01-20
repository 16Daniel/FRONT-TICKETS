import { Timestamp } from "@angular/fire/firestore";

export interface Comentario {
  comentario: string;
  idUsuario: string;
  nombre: string;
  fecha: Date;
  imagenesEvidencia?: string[];

  editando?: boolean;
  comentarioEditado?: string;
}
