export interface SoporteSucursal {
  id?: string;
  idArea: string;
  idSucursal: string;
  idResponsable: string;
  idsUsuarios: string[];
  /** Compatibilidad con documentos previos de un solo analista */
  idUsuario?: string;
}
