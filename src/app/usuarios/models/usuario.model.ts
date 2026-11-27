export class Usuario {
  id?: string | any;
  nombre: string = '';
  apellidoP: string = '';
  apellidoM: string = '';
  idRol: string = '';
  email: string = '';
  password: string = '';
  uid: string = '';
  idSucursal: string = '';
  esGuardia: boolean = false;
  idArea: string | any;
  especialidad: string = '';
  fcmToken: string[] = [];
  eliminado: boolean = false;
  bloqueado: boolean = false;
  intentos: number = 0;
}
