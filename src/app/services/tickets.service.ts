import { Injectable } from '@angular/core';
import {
  addDoc,
  arrayUnion,
  collection,
  collectionData,
  doc,
  docData,
  documentId,
  Firestore,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../models/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
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

  /**
   * Consulta tickets que esten en los estatus enviados
   * @param estatus lista de idEstatusTicket
   * @returns 
   */
  get(): Observable<any[]> {
    const ticketsCollection = collection(this.firestore, 'tickets');
    const q = query(ticketsCollection, where('idEstatusTicket', 'not-in', ['3']));
    return collectionData(q, { idField: 'id' });
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

  getByBranchId(idSucursal: string): Observable<any[]> {
    return new Observable((observer) => {
      // Referencia a la colección
      const collectionRef = collection(this.firestore, 'tickets');

      // Consulta filtrada por el ID del usuario
      const q = query(
        collectionRef,
        where('idSucursal', '==', idSucursal),
        where('idEstatusTicket', 'not-in', ['3'])
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

  updateLastCommentRead(
    ticketId: string,
    idUsuario: string,
    ultimoComentarioLeido: number
  ) {
    const ticketRef = doc(this.firestore, `tickets/${ticketId}`);

    // Actualizar el índice del último comentario leído para un participante
    return updateDoc(ticketRef, {
      participantesChat: arrayUnion({
        idUsuario,
        ultimoComentarioLeido,
      }),
    });
  }

  getHistorialTicketsPorUsuario(
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
      // where('idEstatusTicket', '==', '3'),
      where('fecha', '>=', fechaInicio),
      where('fecha', '<', new Date(fechaFin.getTime() + 24 * 60 * 60 * 1000)),
      orderBy('fecha', 'desc'),
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

  getHistorialTicketsPorResponsable(
    fechaInicio: Date,
    fechaFin: Date,
    idUsuario: string,
    callback: (result: Ticket[] | null) => void
  ): () => void {
    fechaInicio.setHours(0, 0, 0, 0);

    const collectionRef = collection(this.firestore, 'tickets');

    const q = query(
      collectionRef,
      where('idResponsableFinaliza', '==', idUsuario),
      where('idEstatusTicket', '==', '3'),
      where('fechaFin', '>=', fechaInicio),
      where('fechaFin', '<', new Date(fechaFin.getTime() + 24 * 60 * 60 * 1000)),
      orderBy('fecha', 'desc'),
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

  getTicketsPorUsuario(userId: string): Observable<any[]> {
    return new Observable((observer) => {
      // Referencia a la colección
      const collectionRef = collection(this.firestore, 'tickets');

      // Consulta filtrada por el ID del usuario
      const q = query(
        collectionRef,
        where('idUsuario', '==', userId),
        where('idEstatusTicket', 'not-in', ['3'])
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

  getTicketsResponsable(userId: string, esGuardia: boolean): Observable<any[]> {
    return new Observable((observer) => {
      const collectionRef = collection(this.firestore, 'tickets');

      const filtros = [
        where('idEstatusTicket', 'not-in', ['3']), // Siempre se aplica este filtro
        orderBy('fecha', 'desc'), // Siempre ordenamos por fecha
      ];

      if (!esGuardia) {
        filtros.push(where('idResponsables', 'array-contains', userId));
      }

      const q = query(collectionRef, ...filtros);

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

  get30LastTickets(): Observable<any[]> {
    const ticketsCollection = collection(this.firestore, 'tickets');
    const q = query(
      ticketsCollection,
      where('idEstatusTicket', '==', '3'),
      limit(30)
    );
    return collectionData(q, { idField: 'id' });
  }

  async getByIds(idsTickets: string[]): Promise<Ticket[]> {
    const ticketsCollection = collection(this.firestore, 'tickets');

    // Dividir en bloques de 30
    const chunks = [];
    for (let i = 0; i < idsTickets.length; i += 30) {
      chunks.push(idsTickets.slice(i, i + 30));
    }

    const results = await Promise.all(
      chunks.map(async (chunk) => {
        const q = query(ticketsCollection, where(documentId(), 'in', chunk));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }) as Ticket);
      })
    );

    return results.flat();
  }

  async getFinalizedTicketsByEndDate(
    idSucursal: string,
    fecha: Date
  ): Promise<Ticket[]> {
    const ticketsCollection = collection(this.firestore, 'tickets');

    // Rango de día
    const startOfDay = Timestamp.fromDate(new Date(fecha.setHours(0, 0, 0, 0)));
    const endOfDay = Timestamp.fromDate(new Date(fecha.setHours(24, 0, 0, 0))); // siguiente día a las 00:00

    const q = query(
      ticketsCollection,
      where('idEstatusTicket', '==', '3'),
      where('idSucursal', '==', idSucursal),
      where('fechaFin', '>=', startOfDay),
      where('fechaFin', '<', endOfDay)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }) as Ticket);
  }


}
