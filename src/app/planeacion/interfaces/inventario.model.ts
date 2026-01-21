export interface Inventario
{
  codalmacen: string;
  descripcion: string;
  codarticulo: number;
  regulariza: string | null;
  unidadessat: string | null;
  unidadmedida: string | null;
  stock1: number | null;
  ultfecha: Date | null;
  regularizaSemanal: string | null;
  inventarioMensual: string | null;
  orden: number | null;
  validado:boolean|null;
  intentos:number|null; 
  invInicial?:number; 
  diferencia?:number; 
 }

export interface InvModel {
  id?: number;
  branch: number;
  invInicial: number;
  invReg: number;
  diferencia: number;
  intentos: number;
  articulo: string;
  createdBy: number;
  createdDate: String;
  updatedBy: number;
  updatedDate: String;
}