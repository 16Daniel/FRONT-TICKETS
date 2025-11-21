import { Comentario } from "./comentario-chat.model";

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
    idEstatus: string = '1';
    comentarios: Comentario[] = [];
    evidenciaUrls: string[] = [];
}
