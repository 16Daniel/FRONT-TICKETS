import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  doc,
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

  AddTkSQL(data: any): Observable<any> {
    return this.http.post<any>(this.url + 'Tickets/addTicket', data, {
      headers: this.headers,
    });
  }

  getHistorialtickets(
    fechaini: Date,
    fechafin: Date,
    uid: string,
    rol: string
  ): Observable<any[]> {
    let formdata = new FormData();
    formdata.append('fechaini', fechaini.toISOString());
    formdata.append('fechafin', fechafin.toISOString());
    formdata.append('idu', uid);
    formdata.append('rol', rol);
    return this.http.post<any[]>(this.url + `Tickets/getTicktesH`, formdata, {
      headers: this.headers,
    });
  }

  getRealTimeTicketsByUserId(userId: string): Observable<any[]> {
    return new Observable((observer) => {
      // Referencia a la colección
      const collectionRef = collection(this.firestore, 'tickets');

      // Consulta filtrada por el ID del usuario
      const q = query(
        collectionRef,
        where('iduser', '==', userId),
        where('status', 'in', ['1', '2', '4', '5', '6'])
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

  getTicketsResponsable(userId: string): Observable<any[]> {
    return new Observable((observer) => {
      // Referencia a la colección
      const collectionRef = collection(this.firestore, 'tickets');

      // Consulta filtrada por el ID del usuario
      const q = query(
        collectionRef,
        where('responsable', '==', userId),
        where('status', 'in', ['1', '2', '4', '5', '6'])
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

  async addticket(ticket: Ticket) {
    const ref = collection(this.firestore, 'tickets');
    const docRef = await addDoc(ref, ticket);
    return docRef.id; // Devolver el ID del documento creado
  }

  async updateTicket(data: any): Promise<void> {
    let collectionName = 'tickets';
    let docId = data.id;
    const documentRef = doc(this.firestore, `${collectionName}/${docId}`);
    return updateDoc(documentRef, data);
  }

  getTk(idtk: string): Observable<any[]> {
    const sucursalesCollection = collection(this.firestore, 'tickets/' + idtk);
    return collectionData(sucursalesCollection, { idField: 'id' }); // Incluye el ID del documento
  }

  getalltk(): Observable<any[]> {
    const usersCollection = collection(this.firestore, 'tickets');
    return collectionData(usersCollection, { idField: 'id' });
  }

  getTickets(iduser: string): Observable<any[]> {
    const vcollection = collection(this.firestore, 'tickets');
    return collectionData(vcollection, { idField: 'id' }); // Incluye el ID del documento
  }
}
