import { S } from "@fullcalendar/core/internal-common";

export interface SucursalRegion {
  id: number;
  name: string;
  region: string;
}

export interface PreciosAyc {
  id?:number
  ids: number;
  pLunes: number;
  cLunes: string;
  pMartes: number;
  cMartes: string;
  pMiercoles: number;
  cMiercoles: string;
  pJueves: number;
  cJueves: string;
  pViernes: number;
  cViernes: string;
  pSabado: number;
  cSabado: string;
  pDomingo: number;
  cDomingo: string;
  grupo: string;
  nombreSuc?:string; 
}