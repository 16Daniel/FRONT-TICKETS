export interface Bitacora {
  id?: string;
  modulo: string; // Ej. 'TICKETS', 'PROYECTOS'
  referenciaId: string; // Ej. ID del ticket
  tipo: 'COMENTARIO' | 'SISTEMA';
  contenido: string;
  
  // Basado en Responsable
  autor: {
    id: string; // id del Responsable
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
