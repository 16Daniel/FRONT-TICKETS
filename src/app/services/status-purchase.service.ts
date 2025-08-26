import { Injectable } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
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

  get(): Observable<EstatusCompra[] | any> {
    const sucursalesCollection = collection(this.firestore, this.pathName);
    return collectionData(sucursalesCollection, { idField: 'id' }); // Incluye el ID del documento
  }
}
