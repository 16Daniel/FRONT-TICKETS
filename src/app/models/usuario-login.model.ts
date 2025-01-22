import { Sucursal } from "./sucursal.model";

export interface UsuarioLogin {
  id: string;
  nombre: string;
  apellidoP: string;
  apellidoM: string;
  idRol: string;
  email: string;
  uid: string;
  sucursales: Sucursal[];
}
