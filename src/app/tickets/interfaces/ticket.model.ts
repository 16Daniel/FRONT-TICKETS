import { Timestamp } from '@angular/fire/firestore';
export class Ticket {
  id?: string | any;
  idUsuario: string = '';
  idInvolucrados: string[] = [];
  usuariosEtiquetados?: string[] = [];
  idSucursal: any = '';
  idArea: string = '';
  idCategoria: string = '';
  idSubcategoria: string | null = null;
  idTipoSoporte: string | null = '';
  idEstatusTicket: string = '1';
  
  criticidad?: number;
  urgencia?: number;
  score?: number;
  prioridad?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  tiempoResolucion?: number;
  unidadResolucion?: 'm' | 'h' | 'd';
  horasResolucion?: number;

  fecha: Timestamp | any = new Date();
  fechaAtencion?: Timestamp | any;
  fechaFin: Timestamp | null = null;
  solicitante: string = '';
  idResponsable: string = '';

  nombreCategoria: string | null = '';
  nombreSubcategoria: string | null = '';

  descripcion: string = '';


  archivos?: { url: string; nombre: string; tipo: string; }[] = [];
  folio: string = '';

  comentariosFinalesSucursal?: string | null;
  calificacionSucursal: number = 0;
  calificacionAnalista: number = 0;


  validacionAdmin: boolean = false;
  referenciaActivoFijo: string | undefined;

  esAsignadoEspecialista: boolean = false;
  idUsuarioEspecialista: string = '';
}
