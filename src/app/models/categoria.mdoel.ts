import { Subcategoria } from "./subcategoria.model";

export class Categoria {
  id: string | any;
  idArea: string = '';
  nombre: string = '';
  estimacion: number | undefined;
  eliminado: boolean = false;
  subcategorias: Subcategoria[] = [];
  activarSubcategorias: boolean = false;
}
