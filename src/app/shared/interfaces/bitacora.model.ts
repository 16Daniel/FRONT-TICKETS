export interface Bitacora {
  id?: string;
  modulo: string; // Ej. 'TICKETS', 'PROYECTOS'
  referenciaId: string; // Ej. ID del ticket
  tipo: 'COMENTARIO' | 'SISTEMA' | 'ADJUNTO';
  contenido: string;
  
  // Basado en ResponsableTarea
  autor: {
    id: string; // id del ResponsableTarea
    nombre: string;
    correo?: string;
    color?: string;
  };
  
  fechaCreacion: any; // Timestamp de Firestore
  
  archivos?: {
    url: string;
    nombre: string;
    tipo: string;
  }[];
  
  usuariosEtiquetados?: string[]; // IDs de Responsables etiquetados
}
