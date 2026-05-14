import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environments';
import { ITproducto } from '../../planeacion/interfaces/Planecion';
import { Merma } from '../interfaces/Merma';

@Injectable({
  providedIn: 'root'
})
export class PlaneacionService {
  private url: string = environment.ticketsApiConfig.url;
  private headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-API-Key': environment.ticketsApiConfig.apiKey
  });

  private http = inject(HttpClient);

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
