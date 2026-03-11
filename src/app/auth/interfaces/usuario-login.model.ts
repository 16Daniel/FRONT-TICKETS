import { Sucursal } from "../../sucursales/interfaces/sucursal.interface";

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
