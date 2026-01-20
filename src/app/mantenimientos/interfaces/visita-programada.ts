import { Timestamp } from "@angular/fire/firestore";
import { ComentarioVisita } from "./comentario-visita.model";
import { Sucursal } from "../../sucursales/interfaces/sucursal.model";

export interface VisitaProgramada {
   id?: string | any;
   idUsuario: string;
   idArea: string;
   fecha: Timestamp;
   sucursalesProgramadas: Sucursal[] | any[];
   comentarios: ComentarioVisita[];
}
