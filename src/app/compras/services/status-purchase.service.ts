import { Injectable } from '@angular/core';
import { collection, collectionData, Firestore, orderBy, query } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstatusCompra } from '../models/estatus-compras.model';

@Injectable({
  providedIn: 'root'
})
export class StatusPurchaseService {
  pathName: string = 'cat_estatus_compra';

  constructor(private firestore: Firestore, private http: HttpClient) {
  }

  get(): Observable<EstatusCompra[]> {
    const sucursalesCollection = collection(this.firestore, this.pathName);
    const q = query(sucursalesCollection, orderBy('id')); // ordenar por el campo id
    return collectionData(q, { idField: 'id' }) as Observable<EstatusCompra[]>;
  }
}
