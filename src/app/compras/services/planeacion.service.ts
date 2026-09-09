import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environments';
import { ProveedorPlaneacion } from '../interfaces/ProveedorPlaneacion';

@Injectable({
   providedIn: 'root'
})
export class PlaneacionCatService {

   private url: string = environment.planeacionApiConfig.url;

   private headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-API-Key': environment.planeacionApiConfig.apiKey
   });

   private http = inject(HttpClient);

  
  getCatProveedores(): Observable<ProveedorPlaneacion[]> {
      return this.http.get<ProveedorPlaneacion[]>(this.url + 'Catalogos/getProveedores', { headers: this.headers })
   }


}
