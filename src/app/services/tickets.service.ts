import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/enviroments';
import { Ticket } from '../models/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
  private url: string = environment.apiURL;
  private headers = new HttpHeaders();

  constructor(private firestore: Firestore, private http: HttpClient) {
    this.headers.append('Accept', 'application/json');
    this.headers.append('content-type', 'application/json');
  }

  async create(ticket: Ticket) {
    const ref = collection(this.firestore, 'tickets');
    const docRef = await addDoc(ref, ticket);
    return docRef.id;
  }

  get(): Observable<any[]> {
    const ticketsCollection = collection(this.firestore, 'tickets');
    return collectionData(ticketsCollection, { idField: 'id' });
  }

  getById(idTicket: string): Observable<Ticket> {
    const ticketDoc = doc(this.firestore, `tickets/${idTicket}`);
    return docData(ticketDoc, { idField: 'id' }) as Observable<Ticket>;
  }

  async update(data: any): Promise<void> {
    let collectionName = 'tickets';
    let docId = data.id;
    const documentRef = doc(this.firestore, `${collectionName}/${docId}`);
    return updateDoc(documentRef, data);
  }

  // getTicketsPorUsuario(userId: string): Observable<any[]> {
  //   return new Observable((observer) => {
  //     // Referencia a la colección
  //     const collectionRef = collection(this.firestore, 'tickets');

  //     // Consulta filtrada por el ID del usuario
  //     const q = query(
  //       collectionRef,
  //       where('idUsuario', '==', userId),
  //       where('estatus', 'in', [1, 2, 4, 5, 6])
  //     );

  //     // Escucha en tiempo real
  //     const unsubscribe = onSnapshot(
  //       q,
  //       (querySnapshot) => {
  //         const tickets = querySnapshot.docs.map((doc) => ({
  //           id: doc.id,
  //           ...doc.data(),
  //         }));

  //         // Emitir los tickets actualizados
  //         observer.next(tickets);
  //       },
  //       (error) => {
  //         console.error('Error en la suscripción:', error);
  //         observer.error(error);
  //       }
  //     );

  //     // Manejo de limpieza
  //     return { unsubscribe };
  //   });
  // }

  getByBranchId(idSucursal: string): Observable<any[]> {
    return new Observable((observer) => {
      // Referencia a la colección
      const collectionRef = collection(this.firestore, 'tickets');

      // Consulta filtrada por el ID del usuario
      const q = query(
        collectionRef,
        where('idSucursal', '==', idSucursal),
        where('estatus', 'in', [1, 2, 4, 5, 6])
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

  getHistorialticketsPorUsuario(
    fechaInicio: Date,
    fechaFin: Date,
    idUsuario: string,
    callback: (result: Ticket[] | null) => void
  ): () => void {
    fechaInicio.setHours(0, 0, 0, 0);

    const collectionRef = collection(this.firestore, 'tickets');

    const q = query(
      collectionRef,
      where('idUsuario', '==', idUsuario),
      where('estatus', '==', 3),
      where('fechaFin', '>=', fechaInicio),
      where('fechaFin', '<', new Date(fechaFin.getTime() + 24 * 60 * 60 * 1000))
    );

    // Suscribirse a cambios en tiempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        callback(null); // No hay registros
      } else {
        const tickets = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Ticket)
        ); // Tipar cada objeto como Ticket
        callback(tickets); // Devuelve el primer registro
      }
    });

    return unsubscribe;
  }


  getHistorialticketsPorResponsable(
    fechaInicio: Date,
    fechaFin: Date,
    idUsuario: string,
    callback: (result: Ticket[] | null) => void
  ): () => void {
    fechaInicio.setHours(0, 0, 0, 0);

    const collectionRef = collection(this.firestore, 'tickets');

    const q = query(
      collectionRef,
      where('responsable', '==', idUsuario),
      where('estatus', '==', 3),
      where('fechaFin', '>=', fechaInicio),
      where('fechaFin', '<', new Date(fechaFin.getTime() + 24 * 60 * 60 * 1000))
    );

    // Suscribirse a cambios en tiempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        callback(null); // No hay registros
      } else {
        const tickets = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Ticket)
        ); // Tipar cada objeto como Ticket
        callback(tickets); // Devuelve el primer registro
      }
    });

    return unsubscribe;
  }



  getTicketsResponsable(userId: string): Observable<any[]> {
    return new Observable((observer) => {
      // Referencia a la colección
      const collectionRef = collection(this.firestore, 'tickets');

      // Consulta filtrada por el ID del usuario
      const q = query(
        collectionRef,
        where('responsable', '==', userId),
        where('estatus', 'in', [1, 2, 4, 5, 6])
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

  async obtenerSecuencialTickets(): Promise<number> {
    try {
      const sucursalesRef = collection(this.firestore, 'tickets');
      const snapshot = await getDocs(sucursalesRef);
      const count = snapshot.size;
      return count + 1;
    } catch (error) {
      console.error('Error al obtener el count de tickets:', error);
      throw error;
    }
  }
}
