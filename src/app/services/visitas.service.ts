import { Injectable } from '@angular/core';
import { Visita } from '../models/visita';
import { addDoc, collection, collectionData, Firestore, onSnapshot, query, where } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  
    get(userId: string): Observable<any[]> {
        return new Observable((observer) => {
          // Referencia a la colección
          const collectionRef = collection(this.firestore, 'visitas_programadas');
    
          // Consulta filtrada por el ID del usuario
          const q = query(
            collectionRef,
            where('idUsuario', '==', userId)
          );
    
          // Escucha en tiempo real
          const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
              const tickets = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
    
              // Emitir los tickets actualizados
              observer.next(tickets);
            },
            (error) => {
              console.error('Error en la suscripción:', error);
              observer.error(error);
            }
          );
    
          // Manejo de limpieza
          return { unsubscribe };
        });
      }
    
}
