import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, Firestore, orderBy, query } from '@angular/fire/firestore';
import { EntregaAceite } from '../models/aceite.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AceiteService {
 // URL to web api
  public apiURL = environment.apiURL;
  // URL api server
  private url: string = environment.apiURL;
  private headers = new HttpHeaders();

   constructor(private http: HttpClient) 
   {
     this.headers.append("Accept", "application/json");
     this.headers.append("content-type", "application/json");
    }

    getEnttregas(): Observable<EntregaAceite[]> {
      return this.http.get<EntregaAceite[]>(this.url+'Aceite/getEntregasAceite',{headers:this.headers})
    }

}
