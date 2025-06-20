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