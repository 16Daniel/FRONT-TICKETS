import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { collection, collectionData, doc, docData, Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CorreosNotificacionService {
pathname = "correos_notificacion"

  constructor(private firestore: Firestore) {
  }
 get(): Observable<any[]> {
     const correosRef = collection(this.firestore, 'correos_notificacion');
    return collectionData(correosRef, { idField: 'id' });
  }

}
