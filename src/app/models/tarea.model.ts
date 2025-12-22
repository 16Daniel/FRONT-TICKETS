import { Comentario } from "./comentario-chat.model";
import { ResponsableTarea } from "./responsable-tarea.model";

export class Tarea {
    id?: string;
    titulo: string = '';
    descripcion?: string;
    fecha: Date = new Date();
    fechaFin: Date | null = null;
    categoria: string = '';
    idSucursal: string = '';
    idEstatus: string = '1';
    comentarios: Comentario[] = [];
    evidenciaUrls: string[] = [];
    urgente: string = '';
    importante: string = '';
    idEisenhower: string = '';
    subtareas?: { terminado: boolean, titulo: string }[] = [];
    porcentaje: number = 0;
    deathline: Date | null = null;
    responsables: ResponsableTarea[] = []
    eliminado: boolean = false;
    idEtiqueta: string = '';
}
