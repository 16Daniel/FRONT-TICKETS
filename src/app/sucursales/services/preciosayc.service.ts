import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { colorPrecioayc, PreciosAyc, SucursalRegion } from '../interfaces/sucursalRegion';

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
  
     agregarcolorPrecioAYC(color:string,precio:number): Observable<any> {
      let data = new FormData(); 
      data.append("color",color); 
      data.append("precio",precio.toString()); 
      return this.http.post<any>(this.url + 'ColoresAyc/agregarColorAYC',data, { headers: this.headers })
  }

  getColoresPreciosAYC(): Observable<colorPrecioayc[]> {
      return this.http.get<colorPrecioayc[]>(this.url + 'ColoresAyc/getColoresAYC', { headers: this.headers })
  }
  
    eliminarColorePrecioAYC(id:number): Observable<any> {
      return this.http.delete<any>(this.url + 'ColoresAyc/eliminarColorAYC/'+id, { headers: this.headers })
  }
  
    actualizarcolorPrecioAYC(id:number,color:string,precio:number): Observable<any> {
      let data = new FormData(); 
      data.append("color",color); 
      data.append("precio",precio.toString());
      data.append("id",id.toString()); 
      return this.http.put<any>(this.url + 'ColoresAyc/actualizarColorAYC',data, { headers: this.headers })
  }

    eliminarPreciosAYC(id:number): Observable<any> {
      return this.http.delete<any>(this.url + 'Preciosayc/eliminarPreciosAYC/'+id, { headers: this.headers })
  }
  
   actualizarPreciosAYC(data:PreciosAyc): Observable<any> {
      return this.http.post<any>(this.url + 'Preciosayc/actualizarPreciosAYC',data, { headers: this.headers })
  }
}
