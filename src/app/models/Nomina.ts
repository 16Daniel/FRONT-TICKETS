export interface EmpleadoNomina {
  id: number;
  nombre: string;
  departamento:number;
}

export interface UbicacionNomina {
  idUbicacion: number;
  idEmpresa: number; 
  nombre: string;
}

export interface TurnoNomina {
  idTurno: number;
  idEmpresa: number; 
  nombre: string;
}

export interface TurnodbNomina {
  idTurno: number;
  idEmpresa: number; 
  nombre: string;
  alias:string; 
}

export interface PuestoNomina {
  idpuesto: number;
  nombre: string;
}

export interface GuardarTurnoRequest {
    claTrab: number;
    claEmpresa: number;
    claTurno: number;
    fecha: Date;
}

export interface Marcajes {
  cla_trab: number;
  nombre: string;
  idpuesto:number; 
  turno: string;
  entrada: string;
  salida: string;
  incidencia: string;
}

export interface EmpleadoHorario {
  cla_trab: number;
  nom_trab: string;
  ap_paterno: string;
  ap_materno: string;
  cla_puesto: number;
  nom_puesto: string;
  cla_turno: number;
  entrada: string;
  salida: string;
}