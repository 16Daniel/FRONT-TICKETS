import { Time } from "@angular/common";
import { Timestamp } from "@angular/fire/firestore";

export interface Ticket
{
    fecha:Date;
    idsucordpto:number;
    statusSuc:string|null;
    idproveedor:string;
    idcategoria:number;
    decripcion:string; 
    solicitante:string;
    prioridadsuc:string;
    prioridadProv:string|null; 
    status:string; 
    responsable:string; 
    comentarios:any[];
    fechafin:Date|null; 
    duracion:string|null; 
    tiposoporte:string|null; 
    iduser:string;
    nombreCategoria:string;
    folio:string;
 }

 export interface TicketDB
{
    id:string; 
    fecha:Timestamp;
    idsucordpto:string;
    statusSuc:string;
    idproveedor:string;
    idcategoria:number;
    decripcion:string; 
    solicitante:string;
    prioridadsuc:string;
    prioridadProv:string|null; 
    status:string; 
    responsable:string; 
    fechafin:Timestamp|null; 
    duracion:string|null; 
    tiposoporte:string|null; 
    iduser:string;
    comentarios:any[]; 
    nombreCategoria:string|null; 
    comentariosfinales:string|null; 
 }

 export interface TicketDBH
 {
     id:string; 
     fecha:Date;
     idsucordpto:string;
     statusSuc:string;
     idprov:string;
     idcategoria:string;
     descripcion:string; 
     solicitante:string;
     prioridadsuc:string;
     prioridadProv:string|null; 
     status:string; 
     responsable:string; 
     fechafin:Date|null; 
     duracion:string|null; 
     tiposoporte:string|null; 
     iduser:string;
     comentarios:string; 
     nombrecategoria:string|null; 
  }

  
 export interface StatusTK
 {
    nombre:string;
    id:string;
    icon:string;
 }