import { Timestamp } from "@angular/fire/firestore";

export interface Guardia 
{ 
    id?:string|any;
    idUsuario:string; 
    idArea: string;
    fecha:Timestamp;
}
