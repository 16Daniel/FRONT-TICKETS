import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Checada, Empleado, Ubicacion } from '../interfaces/Checadas';
import { environment } from '../../../environments/environments';

@Injectable({
   providedIn: 'root'
})
export class ChecadasService {

   private url: string = environment.planeacionApiConfig.url;

   private headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-API-Key': environment.planeacionApiConfig.apiKey
   });

   private http = inject(HttpClient);

   getUbicaciones(): Observable<Ubicacion[]> {
      return this.http.get<Ubicacion[]>(this.url + 'Checadas/getUbicaciones', { headers: this.headers })
   }

   getDepartamentos(): Observable<Ubicacion[]> {
      return this.http.get<Ubicacion[]>(this.url + 'Checadas/getDepartamentos', { headers: this.headers })
   }

   getEmpleados(id: number): Observable<Empleado[]> {
      return this.http.get<Empleado[]>(this.url + 'Checadas/getEmpleados/' + id, { headers: this.headers })
   }

   getChecadas(idemp: number, fi: string, ff: string): Observable<Checada[]> {
      return this.http.get<Checada[]>(this.url + 'Checadas/getCatStatusChecadas/' + idemp + "/" + fi + "/" + ff, { headers: this.headers })
   }

}
