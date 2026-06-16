import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Articulo, CatMarcasDelivery, ClientesDelivery, ComboDelivery, ComboDeliveryDTO, DiccionarioItem, ModificadorArt } from '../interfaces/diccionariodelivery';
import { TabCombosDelivery } from '../components/tab-combos-delivery/tab-combos-delivery';

@Injectable({
  providedIn: 'root',
})
export class DiccionariodeliveryService 
{
   private apiUrl: string = environment.ticketsApiConfig.url;
    private headers = new HttpHeaders({
      'Accept': 'application/json',
      'X-API-Key': environment.ticketsApiConfig.apiKey
    });
  
    private http = inject(HttpClient);

      getEstructura(): Observable<Articulo[]> {
    return this.http.get<Articulo[]>(this.apiUrl+'PedidosDelivery/getListadiccionario', { headers: this.headers });
  }

  getItem(id: number): Observable<DiccionarioItem> {
    return this.http.get<DiccionarioItem>(`${this.apiUrl}PedidosDelivery/diccionario/${id}`, { headers: this.headers });
  }

  createItem(data: any[]): Observable<any> {
    return this.http.post<any>(this.apiUrl+'PedidosDelivery/diccionario', data, { headers: this.headers });
  }

  updateItem(item: DiccionarioItem): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}PedidosDelivery/diccionario/${item.id}`, item, { headers: this.headers });
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}PedidosDelivery/diccionario/${id}`, { headers: this.headers });
  }
  
  getArticulosICG(secciones:string): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+'PedidosDelivery/getArticulosIcg/'+secciones, { headers: this.headers });
  }

  getModificadoresArt(codart:number): Observable<ModificadorArt[]> {
    return this.http.get<ModificadorArt[]>(this.apiUrl+'PedidosDelivery/getModificadoresArt/'+codart, { headers: this.headers });
  }


  getMarcasDelivery(): Observable<CatMarcasDelivery[]> {
    return this.http.get<CatMarcasDelivery[]>(`${this.apiUrl}PedidosDelivery/getCatMarcas`,{ headers: this.headers });
  }

  agregarCatMarcas(marca: CatMarcasDelivery): Observable<any> {
    return this.http.post(`${this.apiUrl}PedidosDelivery/agregarCatMarcas`, marca,{ headers: this.headers });
  }

  updateCatMarcas(marca: CatMarcasDelivery): Observable<any> {
    return this.http.put(`${this.apiUrl}PedidosDelivery/updateCatMarcas`, marca,{ headers: this.headers });
  }

  eliminarCatMarcas(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}PedidosDelivery/eliminarCatMarcas/${id}`,{ headers: this.headers });
  }

  getClientes(): Observable<ClientesDelivery[]> {
    return this.http.get<ClientesDelivery[]>(`${this.apiUrl}PedidosDelivery/getClientes`,{ headers: this.headers });
  }

  agregarCliente(cliente: ClientesDelivery): Observable<any> {
    return this.http.post(`${this.apiUrl}PedidosDelivery/agregarCliente`, cliente,{ headers: this.headers });
  }

  updateCliente(cliente: ClientesDelivery): Observable<any> {
    return this.http.put(`${this.apiUrl}PedidosDelivery/updateCliente`, cliente,{ headers: this.headers });
  }

  eliminarCliente(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}PedidosDelivery/eliminarCliente/${id}`,{ headers: this.headers });
  }

  getCombos(): Observable<ComboDeliveryDTO[]> {
    return this.http.get<ComboDeliveryDTO[]>(`${this.apiUrl}PedidosDelivery/getCombos`,{ headers: this.headers });
  }

  agregarCombo(combo: ComboDelivery): Observable<any> {
    return this.http.post(`${this.apiUrl}PedidosDelivery/agregarCombo`, combo,{ headers: this.headers });
  }

  updateCombo(combo: ComboDelivery): Observable<any> {
    return this.http.put(`${this.apiUrl}PedidosDelivery/updateCombo`, combo,{ headers: this.headers });
  }

  eliminarCombo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}PedidosDelivery/eliminarCombo/${id}`,{ headers: this.headers });
  }

}
