export type TipoUsuarioSucursal = 'SOPORTE' | 'RECOLECCION_ACEITE';

export interface UsuarioSucursal {
  id?: string;
  tipo: TipoUsuarioSucursal;
  idArea: string;
  idSucursal: string;
  idsUsuarios: string[];
  idResponsable: string;
}
