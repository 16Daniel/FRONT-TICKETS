import { Timestamp } from "@angular/fire/firestore";

export interface Guardia 
{ 
    id?:string|any;
    idUsuario:string; 
    fecha:Timestamp;  
}
