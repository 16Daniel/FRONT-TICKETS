import { Injectable } from '@angular/core';
import { Visita } from '../models/visita-programada';
import { addDoc, collection, Firestore, getDocs, onSnapshot, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisitasService {

  constructor(private firestore: Firestore) { }

  async create(itemVisita: Visita) {
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

  async obtenerVisitaUsuario(fecha: Date, idUsuario: string) {
    const coleccionRef = collection(this.firestore, 'visitas_programadas');

    // Convertir las fechas a timestamps de Firestore
    fecha.setHours(0, 0, 0, 0);
    const consulta = query(
      coleccionRef,
      where('fecha', '==', fecha),
      where('idUsuario', '==', idUsuario)
    );

    const querySnapshot = await getDocs(consulta);
    const documentos: Visita[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visita));

    return documentos;
  }

  async obtenerVisitaFechas(fechaInicial: Date, fechaFinal: Date) {
    const coleccionRef = collection(this.firestore, 'visitas_programadas');

    // Convertir las fechas a timestamps de Firestore
    fechaInicial.setHours(0, 0, 0, 0);
    fechaFinal.setHours(0, 0, 0, 0);

    const consulta = query(
      coleccionRef,
      where('fecha', '>=', fechaInicial),
      where('fecha', '<=', fechaFinal
      )
    );

    const querySnapshot = await getDocs(consulta);
    const documentos: Visita[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visita));

    return documentos;
  }

}
