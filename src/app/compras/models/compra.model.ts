export class Compra {
    id?: string;
    idEstatusCompra: string = '';
    idUsuario: string = '';
    idArea: string = '';
    idSucursal: string = '';
    fecha: Date = new Date;
    articulo: string = '';
    unidades?: number;
    justificacion: string = '';
    eliminado: boolean = false;  
    evidenciaUrls?: string[];
}