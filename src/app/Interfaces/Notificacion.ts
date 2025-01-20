import { Timestamp } from "@angular/fire/firestore";

export interface Notificacion 
{
    titulo:string; 
    mensaje:string; 
    uid:string;
    fecha:Date; 
    abierta:boolean;
    idtk:string; 
    notificado:boolean;  
 }

 export interface NotificacionDB 
 {
    id:string; 
     titulo:string; 
     mensaje:string; 
     uid:string;
     fecha:Timestamp;
     abierta:boolean;  
     idtk:string; 
     notificado:boolean;  
  }