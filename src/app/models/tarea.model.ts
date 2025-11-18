export interface Tarea {
    id: string;
    titulo: string;
    descripcion?: string;
    fecha: Date;
    fechaFin: Date | null;
    idCategoria: string;
    idSucursal: string;
    comentariosGerencia: string;
    comentariosResponsable: string;
    idEstatus: string;
    chat: string[];
    evidenciaUrls: string[];
}