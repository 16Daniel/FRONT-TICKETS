import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environments';

export interface EnviarCorreoRequest {
  titulo: string;
  body: string;
  destinatario: string;
}

@Injectable({
  providedIn: 'root'
})
export class MailService {
  private url: string = environment.ticketsApiConfig.url;
  private headers = new HttpHeaders({
    'Accept': 'application/json',
    'X-API-Key': environment.ticketsApiConfig.apiKey
  });

  private http = inject(HttpClient);

  enviarCorreo(data: EnviarCorreoRequest): Observable<any> {
    return this.http.post<any>(this.url + 'mail/enviarCorreo', data, { headers: this.headers });
  }
}
