import { Timestamp } from "@angular/fire/firestore";

export interface ConteoComensales 
{
 id?:string; 
 fecha: Timestamp;
 idSucursal:string; 
 sucursal:sucursalesComensales;
 competencia:sucursalCompetencia[]; 
 mesas:number;
 comensales:number; 
}

export interface sucursalesComensales
 {
    id?:string;
    nombre:string;
}

export interface sucursalCompetencia
 {
    id?:string;
    nombre:string;
    mesas:number; 
    comensales:number; 
}

export interface itemConteo 
{
 id:string|undefined; 
 fecha: Timestamp;
 nombreSuc:string; 
 sucursal:sucursalesComensales;
 mesas:number;
 comensales:number; 
 idReg:string; 
}