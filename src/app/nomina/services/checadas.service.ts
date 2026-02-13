import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Checada, Empleado, Ubicacion } from '../interfaces/Checadas';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChecadasService {
  // URL api server
  // private url: string = environment.apiURL;
  
  private url: string = 'https://operamx.no-ip.net/back/api_planeacion/api/';
  
  private headers = new HttpHeaders();

  constructor(private http: HttpClient) 
  {
    this.headers.append("Accept", "application/json");
    this.headers.append("content-type", "application/json");
   }

   getUbicaciones():Observable<Ubicacion[]>
   {
      return this.http.get<Ubicacion[]>(this.url+'Checadas/getUbicaciones',{headers:this.headers})
   }

   getDepartamentos():Observable<Ubicacion[]>
   {
      return this.http.get<Ubicacion[]>(this.url+'Checadas/getDepartamentos',{headers:this.headers})
   }

   getEmpleados(id:number):Observable<Empleado[]>
   {
      return this.http.get<Empleado[]>(this.url+'Checadas/getEmpleados/'+id,{headers:this.headers})
   }

   getChecadas(idemp:number, fi:string, ff:string):Observable<Checada[]>
   {
 
      return this.http.get<Checada[]>(this.url+'Checadas/getCatStatusChecadas/'+idemp+"/"+fi +"/"+ff,{headers:this.headers})
   }

}
