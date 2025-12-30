import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

export interface EnviarCorreoRequest {
  titulo: string;
  body: string;
  destinatario: string;
}

@Injectable({
  providedIn: 'root'
})
export class MailService {
  apiUrl = `${environment.apiURL}Mail/enviarCorreo`;

  constructor(private http: HttpClient) { }

  enviarCorreo(data: EnviarCorreoRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
