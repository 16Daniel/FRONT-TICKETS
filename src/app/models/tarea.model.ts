export class Tarea {
    id?: string;
    titulo: string = '';
    // descripcion?: string;
    fecha: Date = new Date();
    fechaFin: Date | null = null;
    idCategoria: string = '';
    idSucursal: string = '';
    comentariosGerencia: string = '';
    comentariosResponsable: string = '';
    idEstatus: string = '';
    chat: string[] = [];
    evidenciaUrls: string[] = [];
}
