import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  Firestore,
  onSnapshot,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Notificacion } from '../models/notificacion.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  pathName: string = 'notificaciones';

  constructor(private firestore: Firestore) {}

  getNotificaciones(userId: string): Observable<any[]> {
    return new Observable((observer) => {
      // Referencia a la colección
      const collectionRef = collection(this.firestore, this.pathName);

      // Consulta filtrada por el ID del usuario
      const q = query(collectionRef, where('uid', '==', userId));

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

  async addNotifiacion(notificacion: Notificacion) {
    const ref = collection(this.firestore, this.pathName);
    const docRef = await addDoc(ref, notificacion);
    return docRef.id; // Devolver el ID del documento creado
  }
}
