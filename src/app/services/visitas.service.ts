import { Injectable } from '@angular/core';
import { Visita } from '../models/visita';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VisitasService {

  constructor(private firestore: Firestore, private http: HttpClient) {
      
    }

   async create(itemVisita:Visita) {
      const ref = collection(this.firestore, 'visitas_programadas');
      const docRef = await addDoc(ref, itemVisita);
      return docRef.id;
    }

}
