import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environments';
import { Inventario } from '../interfaces/inventario.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  // URL to web api
  public apiURL = environment.apiURL;
  // URL api server
  private url: string = environment.apiURL;
  private headers = new HttpHeaders();

  constructor(private http: HttpClient) {
    this.headers.append("Accept", "application/json");
    this.headers.append("content-type", "application/json");
  }

  obtenerArticulos(idSucursal: number): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(this.url + 'Iventario/getArticulos/' + idSucursal, { headers: this.headers })
  }

  obtenerArticulosV(idSucursal: number): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(this.url + 'Iventario/getArticulosV/' + idSucursal, { headers: this.headers })
  }

  validarStock(idSucursal: number, codarticulo: number, cantidad: string): Observable<any> {
    return this.http.get<any>(this.url + 'Iventario/ValidateStock/' + idSucursal + "/" + codarticulo + "/" + cantidad, { headers: this.headers })
  }

  validarStockV(idSucursal: number, codarticulo: number, cantidad: string): Observable<any> {
    return this.http.get<any>(this.url + 'Iventario/ValidateStockV/' + idSucursal + "/" + codarticulo + "/" + cantidad, { headers: this.headers })
  }

  validarCaptura(idSucursal: number): Observable<any> {
    return this.http.get<any>(this.url + 'Iventario/ValidarCaptura/' + idSucursal, { headers: this.headers })
  }

  regularizar(codart: number, idSucursal: string, cantidad: number): Observable<any> {
    let data = new FormData();
    data.append("codArticulo", codart.toString());
    data.append("codAlmacen", idSucursal.toString());
    data.append("cantidad", cantidad.toString());
    return this.http.post<any>(this.url + 'Iventario/AddRegularizate', data, { headers: this.headers })
  }

  regularizarV(codart: number, idSucursal: string, cantidad: number): Observable<any> {
    let data = new FormData();
    data.append("codArticulo", codart.toString());
    data.append("codAlmacen", idSucursal.toString());
    data.append("cantidad", cantidad.toString());
    return this.http.post<any>(this.url + 'Iventario/AddRegularizateV/', data, { headers: this.headers })
  }

  obtenerPresentaciones(codart: number): Observable<number[]> {
    return this.http.get<number[]>(this.url + 'Iventario/getUmedidas/' + codart, { headers: this.headers })
  }

  addInventario(data: any): Observable<any> {
    return this.http.post<any>(this.url + 'Iventario/AddInventario/', data, { headers: this.headers })
  }
}
