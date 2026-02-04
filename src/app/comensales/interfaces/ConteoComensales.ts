import { Timestamp } from "@angular/fire/firestore";

export interface ConteoComensales 
{
 id?:string; 
 fecha: Timestamp;
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
