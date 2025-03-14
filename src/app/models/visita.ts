import { Timestamp } from "@angular/fire/firestore";
import { Sucursal } from "./sucursal.model";

export interface Visita 
{
    id?:string|any;
    idUsuario:string; 
    fecha:Timestamp; 
    sucursales:Sucursal[];  
    comentarios:ComentarioVisita[]; 
 }
 export interface ComentarioVisita
 {
    idSucursal:string;
    comentario:string; 
 } 