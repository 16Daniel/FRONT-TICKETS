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
      'X-API-Key': environment.planeacionApiConfig.apiKey
   });

   private http = inject(HttpClient);

  
  getCatProveedores(): Observable<ProveedorPlaneacion[]> {
      return this.http.get<ProveedorPlaneacion[]>(this.url + 'Catalogos/getProveedores', { headers: this.headers })
   }

    getProveedoresPorModulo(modulo: string): Observable<ProveedorPlaneacion[]> {
    return this.http.get<ProveedorPlaneacion[]>(`${this.url}Catalogos/getProveedoresTicketCompra/${modulo}`, { headers: this.headers });
  }

  getAllProveedores(): Observable<ProveedorPlaneacion[]> {
    return this.http.get<ProveedorPlaneacion[]>(`${this.url}Catalogos/getProveedoresActivos`, { headers: this.headers });
  }

  agregarProveedores(ids: number[], modulo: string): Observable<any> {
    debugger
    const formData = new FormData();
    formData.append('jdata', JSON.stringify(ids));
    formData.append('modulo', modulo);
    return this.http.post(`${this.url}Catalogos/agregarProveedoresTicketCompra`, formData, { headers: this.headers });
  }

  // Eliminar uno o varios proveedores de un módulo
  borrarProveedores(ids: number[], modulo: string): Observable<any> {
    const formData = new FormData();
    formData.append('jdata', JSON.stringify(ids));
    formData.append('modulo', modulo);
    return this.http.post(`${this.url}Catalogos/borrarProveedoresTicketCompra`, formData, { headers: this.headers });
  }


}
