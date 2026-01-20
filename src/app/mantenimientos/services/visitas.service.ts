import { Injectable } from '@angular/core';
import { addDoc, collection, Firestore, getDocs, onSnapshot, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { VisitaProgramada } from '../interfaces/visita-programada';

@Injectable({
  providedIn: 'root'
})
export class VisitasService {

  constructor(private firestore: Firestore) { }

  async create(itemVisita: VisitaProgramada) {
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
    const documentos: VisitaProgramada[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VisitaProgramada));

    return documentos;
  }

  async obtenerVisitaFechas(fechaInicial: Date, fechaFinal: Date, idArea?: string) {
    const coleccionRef = collection(this.firestore, 'visitas_programadas');

    fechaInicial.setHours(0, 0, 0, 0);
    fechaFinal.setHours(0, 0, 0, 0);

    const filtros: any[] = [
      where('fecha', '>=', fechaInicial),
      where('fecha', '<=', fechaFinal)
    ];

    if (idArea) {
      filtros.push(where('idArea', '==', idArea));
    }

    const consulta = query(coleccionRef, ...filtros);

    const querySnapshot = await getDocs(consulta);
    const documentos: VisitaProgramada[] = querySnapshot.docs.map(
      doc => ({ id: doc.id, ...doc.data() } as VisitaProgramada)
    );

    return documentos;
  }


}
