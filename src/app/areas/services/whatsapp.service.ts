import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environments.prod';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { GrupoWhatsapp } from '../interfaces/area.model';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WhatsappService 
{
 public urlbase = 'https://api.ultramsg.com/'+environment.whatsappApiConfig.instancia+'/';

 private headers = new HttpHeaders({
     'Accept': 'application/json',
   });
 
   public params = new HttpParams().set('token', environment.whatsappApiConfig.token);

   private http = inject(HttpClient);

//  enviarMensajeTexto(phone: string, message: string): Observable<any> {
//    const body = {
//     token : environment.whatsappApiConfig.token,
//      to: phone,
//      body: message,
//    };
 
//    return this.http.post(this.urlbase + 'messages/chat', body, { headers: this.headers, params: this.params });
//  }

 async enviarMensajeTexto(phone: string, message: string): Promise<any> {
  const body = {
    token: environment.whatsappApiConfig.token,
    to: phone,
    body: message,
  };

  // Convertimos el Observable de HttpClient a una Promise de una sola ejecución
  return await firstValueFrom(this.http.post(this.urlbase + 'messages/chat', body, { headers: this.headers, params: this.params }));
}

   obtenergrupos(): Observable<GrupoWhatsapp[]> {
       return this.http.get<GrupoWhatsapp[]>(this.urlbase + 'groups', { headers: this.headers, params: this.params })
     }
}
