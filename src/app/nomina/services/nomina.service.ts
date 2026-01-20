import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { EmpleadoHorario, EmpleadoNomina, HistorailPersonal, Marcajes, PuestoNomina, TurnodbNomina, TurnoNomina, UbicacionNomina } from '../interfaces/Nomina';

@Injectable({
  providedIn: 'root'
})
export class NominaService {
  // URL to web api
  public apiURL = environment.apiURL;
  // URL api server
  private url: string = environment.apiURL;
  private headers = new HttpHeaders();

  constructor(private http: HttpClient) {
    this.headers.append("Accept", "application/json");
    this.headers.append("content-type", "application/json");
  }

  getDepartamentos(): Observable<PuestoNomina[]> {
    return this.http.get<PuestoNomina[]>(this.url + 'CalendarioNomina/getDepartamentos', { headers: this.headers })
  }

  getUbicaciones(): Observable<UbicacionNomina[]> {
    return this.http.get<UbicacionNomina[]>(this.url + 'CalendarioNomina/getUbicaciones', { headers: this.headers })
  }

  getTurnos(): Observable<TurnoNomina[]> {
    return this.http.get<TurnoNomina[]>(this.url + 'CalendarioNomina/getTurnos', { headers: this.headers })
  }

  getTurnosdb(): Observable<TurnodbNomina[]> {
    return this.http.get<TurnodbNomina[]>(this.url + 'CalendarioNomina/getTurnosdb', { headers: this.headers })
  }

  addTurnodb(idturno: number, nombre: string, alias: string): Observable<any> {
    let formdata = new FormData();
    formdata.append("cla_turno", idturno.toString());
    formdata.append("nombre", nombre);
    formdata.append("alias", alias);
    return this.http.post<any>(this.url + 'CalendarioNomina/guardarTurnodb', formdata, { headers: this.headers })
  }

  borrarTurno(cla_turno: number): Observable<any> {
    return this.http.delete<any>(this.url + 'CalendarioNomina/borrarTurnodb/' + cla_turno, { headers: this.headers })
  }

  getEmpleados(idubicacion: number): Observable<EmpleadoNomina[]> {
    return this.http.get<EmpleadoNomina[]>(this.url + 'CalendarioNomina/getEmpleados/' + idubicacion, { headers: this.headers })
  }

  guardarTurnosCalendario(data: any): Observable<any> {
    return this.http.post<any>(this.url + 'CalendarioNomina/guardarTurnos', data, { headers: this.headers })
  }

  consultarMarcajes(idUbicacion: number, fechaIni: Date, fechaFin: Date): Observable<Marcajes[]> {
    let formdata = new FormData();
    formdata.append("idUbicacion", idUbicacion.toString());
    formdata.append("fechaIni", fechaIni.toISOString());
    formdata.append("fechaFin", fechaFin.toISOString());
    return this.http.post<Marcajes[]>(this.url + 'PersonalNominas/getPersonalNominas', formdata, { headers: this.headers })
  }

  consultarCalendario(idUbicacion: number, fecha: Date): Observable<EmpleadoHorario[]> {
    let formdata = new FormData();
    formdata.append("idSuc", idUbicacion.toString());
    formdata.append("fecha", fecha.toISOString());
    return this.http.post<EmpleadoHorario[]>(this.url + 'PersonalNominas/gethorariosSuc', formdata, { headers: this.headers })
  }

  enviarCorreo(idSucursal: number, nombreRegional: string, correo: string, jdata: string): Observable<EmpleadoHorario[]> {
    let formdata = new FormData();
    formdata.append("idSuc", idSucursal.toString());
    formdata.append("nombreRegional", nombreRegional);
    formdata.append("correo", correo);
    formdata.append("jdata", jdata);
    return this.http.post<EmpleadoHorario[]>(this.url + 'PersonalNominas/correoNotificacion', formdata, { headers: this.headers })
  }

  guardarSolucion(idSuc: number, idemp: number, solucion: string): Observable<EmpleadoHorario[]> {
    let formdata = new FormData();
    formdata.append("idSuc", idSuc.toString());
    formdata.append("idemp", idemp.toString());
    formdata.append("solucion", solucion);
    return this.http.post<EmpleadoHorario[]>(this.url + 'PersonalNominas/registrarSolucion', formdata, { headers: this.headers })
  }

  guardarComentarioSuc(idReg: number, comentario: string): Observable<EmpleadoHorario[]> {
    let formdata = new FormData();
    formdata.append("idReg", idReg.toString());
    formdata.append("comentario", comentario);
    return this.http.post<EmpleadoHorario[]>(this.url + 'PersonalNominas/registrarComentarioSuc', formdata, { headers: this.headers })
  }

  confirmarSolucion(id: number): Observable<any> {
    return this.http.get<any>(this.url + 'PersonalNominas/confirmarSolucion/' + id, { headers: this.headers })
  }

  obtnerHistorialPersonal(fechaini: Date, fechafin: Date, jdata: string): Observable<HistorailPersonal[]> {
    let formdata = new FormData();
    formdata.append("fechaini", fechaini.toISOString());
    formdata.append("fechafin", fechafin.toISOString());
    formdata.append("jdatasuc", jdata);
    return this.http.post<HistorailPersonal[]>(this.url + 'PersonalNominas/HistorialPersonal', formdata, { headers: this.headers })
  }
}
