export interface EntregaAceite {
  id?:string;   
  idSucursal:number;
  fecha:Date;                 
  entregaCedis: number | null;  
  entregaSucursal: number | null;  
  porcentaje75: number | null;     
  intercambio: number | null;     
  diferencia: number | null;      
  comentariosCedis: string | null; 
  comentariosSucursal: string | null; 
  status:number; 
}