import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environments';
import { ITproducto } from '../../planeacion/interfaces/Planecion';
import { Merma } from '../interfaces/Merma';

@Injectable({
  providedIn: 'root'
})
export class PlaneacionService {
  // URL to web api
  public apiURL = environment.apiURL;
  // URL api server
  private url: string = environment.apiURL;
  private headers = new HttpHeaders();

  constructor(private http: HttpClient) {
    this.headers.append("Accept", "application/json");
    this.headers.append("content-type", "application/json");
  }

  getDiccionario(): Observable<ITproducto[]> {
    return this.http.get<ITproducto[]>(this.url + 'DiccionarioPlaneacion/getDiccionario', { headers: this.headers })
  }

  eliminarRegistro(rfc: string, noIdentificacion: string) {
    return this.http.delete<ITproducto[]>(this.url + 'DiccionarioPlaneacion/EliminarMedidaUds/' + rfc + "/" + noIdentificacion, { headers: this.headers })
  }
  actualizarDiccionario(data: any) {
    return this.http.post<any>(this.url + 'DiccionarioPlaneacion/UpdateMedidaUds/', data, { headers: this.headers })
  }

  getMermas(data: any): Observable<Merma[]> {
    return this.http.post<Merma[]>(this.url + 'Mermas/getMermas', data, { headers: this.headers })
  }

}
