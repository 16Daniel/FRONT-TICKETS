import { Comentario } from "../../shared/interfaces/comentario-chat.model";

export class Tarea {
  id?: string;
  titulo: string = '';
  descripcion?: string;
  fecha: Date = new Date();
  fechaFin: Date | null = null;
  categoria: string = '';
  idSucursal: string = '';
  idEstatus: string = '1';
  orden: number = 0;
  comentarios: Comentario[] = [];
  evidenciaUrls: string[] = [];
  urgente: string = '';
  importante: string = '';
  idEisenhower: string = '';
  subtareas?: {
    titulo: string;
    terminado: boolean;
    idResponsable?: string | null;
  }[] = [];
  porcentaje: number = 0;
  deathline: Date | null = null;
  idsResponsables: string[] = [];
  idResponsablePrincipal: string | any;
  eliminado: boolean = false;
  idEtiqueta: string = '';
  visibleGlobal: boolean = true;
}
