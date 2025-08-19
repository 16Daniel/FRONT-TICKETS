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
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { HttpHeaders } from '@angular/common/http';
import { combineLatest, map, Observable } from 'rxjs';
import { Ticket } from '../models/ticket.model';
import { ActivoFijo } from '../models/activo-fijo.model';

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
  private headers = new HttpHeaders();

  constructor(private firestore: Firestore) {

    // this.getAll().subscribe(result => {
    //   console.log(result);
    // });
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
  get(idArea?: string): Observable<any[]> {
    const ticketsCollection = collection(this.firestore, 'tickets');

    const filtros: any[] = [
      where('idEstatusTicket', 'not-in', ['3'])
    ];

    if (idArea) {
      filtros.push(where('idArea', '==', idArea));
    }

    const q = query(ticketsCollection, ...filtros);

    return collectionData(q, { idField: 'id' });
  }

  getByArea(idArea: string): Observable<any[]> {
    const ticketsCollection = collection(this.firestore, 'tickets');
    const q1 = query(ticketsCollection,
      where('idEstatusTicket', 'not-in', ['3']), where('idArea', '==', idArea));

    const q2 = query(ticketsCollection,
      where('idEstatusTicket', '==', '3'),
      where('validacionAdmin', '==', false),
      where('idArea', '==', idArea)
    );

    // Convertir ambas consultas a Observables
    const query1$ = collectionData(q1, { idField: 'id' });
    const query2$ = collectionData(q2, { idField: 'id' });

    // Combinar y eliminar duplicados
    return combineLatest([query1$, query2$]).pipe(
      map(([results1, results2]) => {
        // Combinar resultados y eliminar duplicados por ID
        const combined = [...results1, ...results2];
        return combined.filter((ticket, index, self) =>
          index === self.findIndex(t => t['id'] === ticket['id'])
        );
      })
    );

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
    idArea: string,
    callback: (result: Ticket[] | null) => void
  ): () => void {
    fechaInicio.setHours(0, 0, 0, 0);

    const collectionRef = collection(this.firestore, 'tickets');

    const q = query(
      collectionRef,
      where('idUsuario', '==', idUsuario),
      where('idArea', '==', idArea),
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

  getTicketsResponsable(idUsuario: string, esGuardia: boolean, idArea: string): Observable<any[]> {
    return new Observable((observer) => {
      const collectionRef = collection(this.firestore, 'tickets');

      const filtros = [
        where('idEstatusTicket', 'not-in', ['3']), // Siempre se aplica este filtro
        where('idArea', '==', idArea),
        orderBy('fecha', 'desc'), // Siempre ordenamos por fecha
      ];

      if (!esGuardia) {
        filtros.push(where('idResponsables', 'array-contains', idUsuario));
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
    let counterRef = doc(this.firestore, 'consecutivos/tickets');

    const snapshot = await getDoc(counterRef);

    if (!snapshot.exists()) {
      throw new Error('El contador no existe');
    }

    const data = snapshot.data();
    return (data['total'] ?? 0) + 1;
  }

  async incrementarContadorTickets(): Promise<void> {
    let counterRef = doc(this.firestore, 'consecutivos/tickets');

    await updateDoc(counterRef, {
      total: increment(1),
    });
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
    fecha: Date,
    idArea: string
  ): Promise<Ticket[]> {
    const ticketsCollection = collection(this.firestore, 'tickets');

    // Rango de día
    const startOfDay = Timestamp.fromDate(new Date(fecha.setHours(0, 0, 0, 0)));
    const endOfDay = Timestamp.fromDate(new Date(fecha.setHours(24, 0, 0, 0))); // siguiente día a las 00:00

    const q = query(
      ticketsCollection,
      where('idEstatusTicket', '==', '3'),
      where('idSucursal', '==', idSucursal),
      where('idArea', '==', idArea),
      where('fechaFin', '>=', startOfDay),
      where('fechaFin', '<', endOfDay)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }) as Ticket);
  }

  async obtenerTicketsPorActivo(activo: ActivoFijo): Promise<Ticket[]> {
    const referencias = [activo.referencia, ...(activo.referenciasAnteriores || [])];

    const collectionRef = collection(this.firestore, 'tickets');
    const q = query(collectionRef, where('referenciaActivoFijo', 'in', referencias));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Ticket);
  }

  async obtenerTicketsEntreFechas(
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<any[]> {
    const ticketsCollection = collection(this.firestore, 'tickets');

    const q = query(ticketsCollection,
      where('fecha', '>=', fechaInicio),
      where('fecha', '<', new Date(fechaFin.getTime() + 24 * 60 * 60 * 1000)),
      orderBy('fecha', 'desc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  getAll(): Observable<Ticket[] | any[]> {
    const sucursalesCollection = collection(this.firestore, 'tickets');
    return collectionData(sucursalesCollection, { idField: 'id' });
  }

  getTicketsPorEspecialista(idUsuarioEspecialista: string): Observable<Ticket[]> {
    const ticketsCollection = collection(this.firestore, 'tickets');

    const q = query(
      ticketsCollection,
      where('idUsuarioEspecialista', '==', idUsuarioEspecialista),
      where('idEstatusTicket', 'not-in', ['3']),
      where('esAsignadoEspecialista', '==', true),
    );

    return collectionData(q, { idField: 'id' }) as Observable<Ticket[]>;
  }

  getTicketsPorFolio(folio: string): Observable<Ticket[]> {
    const ticketsCollection = collection(this.firestore, 'tickets');

    const q = query(
      ticketsCollection,
      where('folio', '==', folio),
    );

    return collectionData(q, { idField: 'id' }) as Observable<Ticket[]>;
  }
}
