import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, Firestore, orderBy, query } from '@angular/fire/firestore';
import { EntregaAceite } from '../models/aceite.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AceiteService {
public nombreColeccion:string = 'aceites'; 
 
  constructor(private firestore: Firestore) {
  }
 
    getCollection(): Observable<any[]> {
    const collectionRef = collection(this.firestore, this.nombreColeccion);
    const q = query(collectionRef, orderBy('fecha'));
    return collectionData(q, { idField: 'id' });
    }

async create(aceite:EntregaAceite ) {
    const ref = collection(this.firestore, this.nombreColeccion);
    const docRef = await addDoc(ref, aceite);
    return docRef.id;
  }

}
