import { Sucursal } from './sucursal.model';

export class Usuario {
  id?: string | any;
  nombre: string = '';
  apellidoP: string = '';
  apellidoM: string = '';
  idRol: string = '';
  email: string = '';
  password: string = '';
  uid: string = '';
  sucursales: Sucursal[] = [];
  esGuardia: boolean = false;
  idArea: string | any;
  controlDeAceite?: boolean | null;
  especialidad: string = '';
}
