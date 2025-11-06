export interface EntregaAceite {
  id:number;   
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
  manual:boolean; 
  fechaRecoleccion:Date|null; 
}