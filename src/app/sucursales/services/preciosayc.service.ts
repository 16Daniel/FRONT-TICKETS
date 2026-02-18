import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PreciosAyc, SucursalRegion } from '../interfaces/sucursalRegion';

@Injectable({
  providedIn: 'root'
})
export class PreciosaycService {
 // URL to web api
  public apiURL = environment.apiURL;
  // URL api server
  private url: string = environment.apiURL;
  private headers = new HttpHeaders();

  constructor(private http: HttpClient) {
    this.headers.append("Accept", "application/json");
    this.headers.append("content-type", "application/json");
  }

  getSucursalesRegion(): Observable<SucursalRegion[]> {
      return this.http.get<SucursalRegion[]>(this.url + 'Catalogos/getSucursalesGrupo', { headers: this.headers })
  }

   agregarPreciosAYC(data:PreciosAyc): Observable<any> {
      return this.http.post<any>(this.url + 'Preciosayc/agregarPreciosAYC',data, { headers: this.headers })
  }

   getPreciosAYC(): Observable<PreciosAyc[]> {
      return this.http.get<PreciosAyc[]>(this.url + 'Preciosayc/getPreciosAYC', { headers: this.headers })
  }

}
