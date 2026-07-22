// src/app/models/diccionario.model.ts
export interface DiccionarioItem {
  id: number;
  tienda: number;
  nombre: string;
  codIcg: number;
  esModificador: boolean;
  codModificador?: number;
  idMenu?: number;
}

export interface Articulo {
  id: number;
  tienda: number;
  nombre: string;
  codIcg: number;
  codModificador?: number;
  idMenu:number; 
  nombreicg:string;
  modificadores:Modificador[];  
}

export interface Modificador {
  id: number;
  tienda: number;
  nombre: string;
  codIcg: number;
  codModificador?: number;
  idMenu:number; 
  nombreicg:string; 
  nombremodificador:string
}

export interface ModificadorArt {
  codmodificador: number;
  codarticulo: number;
  descripcion: string;
  nombremodificador: string;
  nombreapp:string; 
}

export interface CatMarcasDelivery {
    id?: number;
    nombre: string;
    secciones?: string;
}

export interface ClientesDelivery {
    id?: number;
    marca: number;
    plataforma: string;
    codcliente: number;
    diseñoTicket?: string;
}

export interface ComboDelivery {
    id?: number;
    idcombo: number;
    articulos: string;
    idmarca:number;
}

export interface ComboDeliveryDTO {
    id?: number;
    idcombo: number;
    nombrecombo:string; 
    articulos:ArticuloComboDelivery[];
    idmarca:number;
}

export interface ArticuloComboDelivery
{
  codarticulo:number;
  nombre:string; 
}