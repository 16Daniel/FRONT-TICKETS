import { S } from "@fullcalendar/core/internal-common";

export interface SucursalRegion {
  id: number;
  name: string;
  region: string;
}

export interface PreciosAyc {
  id?:number
  ids: number;
  cLunes:number;
  cMartes: number;
  cMiercoles: number;
  cJueves: number;
  cViernes: number;
  cSabado: number;
  cDomingo: number;
  grupo: string;
  nombreSuc?:string; 
}

export interface colorPrecioayc
{
  id?:number; 
  color:string; 
  precio:number; 
}