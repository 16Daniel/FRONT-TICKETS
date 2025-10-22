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
 }
