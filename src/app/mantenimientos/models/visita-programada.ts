import { Timestamp } from "@angular/fire/firestore";
import { Sucursal } from "./sucursal.model";
import { ComentarioVisita } from "./comentario-visita.model";

export interface VisitaProgramada {
   id?: string | any;
   idUsuario: string;
   idArea: string;
   fecha: Timestamp;
   sucursalesProgramadas: Sucursal[] | any[];
   comentarios: ComentarioVisita[];
}
