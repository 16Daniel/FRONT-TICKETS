import { Sucursal } from './sucursal.model';

export interface Usuario {
  nombre: string;
  apellidoP: string;
  apellidoM: string;
  idRol: string;
  email: string;
  password: string;
  uid: string;
  sucursales: Sucursal[];
}
