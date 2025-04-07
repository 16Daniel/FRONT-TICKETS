import { Timestamp } from "@angular/fire/firestore";
import { Sucursal } from "./sucursal.model";
import { ComentarioVisita } from "./comentario-visita.model";

export interface Visita {
   id?: string | any;
   idUsuario: string;
   fecha: Timestamp;
   sucursales: Sucursal[] | any[];
   comentarios: ComentarioVisita[];
}
