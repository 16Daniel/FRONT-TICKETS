export interface Ubicacion 
{
    id:number; 
    name:string;
 }

 export interface Empleado 
{ 
    id:number;
    nombre:string, 
    apellidop:string; 
    apellidom:string;
}

export interface Checada 
{
    fecha:Date;
    cla_trab:number;
    cla_reloj:number;
    nom_reloj:string;
    nombre:string;
    ap_paterno:string;
    ap_materno:string;  
 }

 export interface Evento 
{
    idUbicacion:number
    nombreubicacion:string;
    horaEntrada:any;
    HoraSalida:any; 
    numdia:number; 
    numsemana:number; 
 }

 export interface Reporte 
{
    nombre:string;
    calendarizadas:number;
    calendarizadas_visitadas:number;
    visitas_no_calendarizadas:number; 
    total_visitas:number;
    cumplimiento:number; 
    horas_laboradas:number; 
    lunes:ReporteDia;
    martes:ReporteDia;
    miercoles:ReporteDia; 
    jueves:ReporteDia;
    viernes:ReporteDia;
    sabado:ReporteDia;
    domingo:ReporteDia;
 } 

  export interface ReporteDia
 {  
      fecha:Date;
    calendarizadas:number;
    calendarizadas_visitadas:number;
    visitas_no_calendarizadas:number; 
    total_visitas:number;
    cumplimiento:number; 
    horas_laboradas:number; 
    tabla:itable[]; 
 }

 export interface itable
 {
    sucursal:string;
    fecha:Date; 
    entrada:any;
    salida:any;
    estadia:any;
 }

