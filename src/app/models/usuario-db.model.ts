import { Sucursal } from './sucursal.model';

export interface UsuarioDB {
  id: string;
  nombre: string;
  apellidoP: string;
  apellidoM: string;
  idRol: string;
  email: string;
  password: string;
  uid: string;
  sucursales: Sucursal[];
}
