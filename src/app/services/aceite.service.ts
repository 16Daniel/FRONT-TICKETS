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

    getEntregas(idFront:number): Observable<EntregaAceite[]> {
      return this.http.get<EntregaAceite[]>(this.url+'Aceite/getEntregasAceitePendientes/'+idFront,{headers:this.headers})
    }
    
     getEntregasCedis(): Observable<EntregaAceite[]> {
      return this.http.get<EntregaAceite[]>(this.url+'Aceite/getEntregasAceitePendientesCedis',{headers:this.headers})
    }
    

       getEntregasH(idFront:number,fechaIni:Date,fechafin:Date): Observable<EntregaAceite[]> {
         let formdata = new FormData();
      formdata.append("ids",idFront.toString());
      formdata.append("fechaini",fechaIni.toISOString());
      formdata.append("fechafin",fechafin.toISOString());
      return this.http.post<EntregaAceite[]>(this.url+'Aceite/getEntregasAceiteH',formdata,{headers:this.headers})
    }

    ActualizarEntrega(idReg:number,cantidad:number,comentarios:string): Observable<any> {
       let formdata = new FormData();
      formdata.append("idReg",idReg.toString());
      formdata.append("cantidad",cantidad.toString());
      formdata.append("comentarioSuc",comentarios);
      return this.http.post<any>(this.url+'Aceite/UpdateEntregaAceite',formdata,{headers:this.headers})
    }

     ValidacionCedis(idReg:number,comentarios:string): Observable<any> {
       let formdata = new FormData();
      formdata.append("idReg",idReg.toString());
      formdata.append("comentarioCedis",comentarios);
      return this.http.post<any>(this.url+'Aceite/ValidacionCedis',formdata,{headers:this.headers})
    }

     RechazoCedis(idReg:number,comentarios:string): Observable<any> {
       let formdata = new FormData();
      formdata.append("idReg",idReg.toString());
      formdata.append("comentarioCedis",comentarios);
      return this.http.post<any>(this.url+'Aceite/RechazoCedis',formdata,{headers:this.headers})
    }

      getEntregasCedisH(idFront:number,fechaIni:Date,fechafin:Date): Observable<EntregaAceite[]> {
         let formdata = new FormData();
      formdata.append("ids",idFront.toString());
      formdata.append("fechaini",fechaIni.toISOString());
      formdata.append("fechafin",fechafin.toISOString());
      return this.http.post<EntregaAceite[]>(this.url+'Aceite/getEntregasAceiteCedisH',formdata,{headers:this.headers})
    }

    exportarHistorialEntregas(dataH:EntregaAceite[]): Observable<any> {
      return this.http.post<any>(this.url+'Aceite/generar-excel',dataH,{headers:this.headers});
    }
    
    agregarEntregaManual(ids:number,fecha:Date): Observable<any> {
      let data = new FormData(); 
      data.append("ids",ids.toString());
      data.append("fecha",fecha.toISOString()); 
      return this.http.post<any>(this.url+'Aceite/agregarEntregaManual',data,{headers:this.headers});
    }

}
