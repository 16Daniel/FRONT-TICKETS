import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, onSnapshot, query, where, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Bitacora } from '../interfaces/bitacora.model';

@Injectable({
  providedIn: 'root'
})
export class BitacoraService {
  private collectionName = 'bitacoras';

  constructor(private firestore: Firestore) {}

  /**
   * Obtiene las entradas de bitácora para un módulo y referencia específica.
   */
  getBitacoras(modulo: string, referenciaId: string): Observable<Bitacora[]> {
    const bitacorasRef = collection(this.firestore, this.collectionName);
    const q = query(
      bitacorasRef,
      where('modulo', '==', modulo),
      where('referenciaId', '==', referenciaId),
      orderBy('fechaCreacion', 'asc')
    );

    return new Observable<Bitacora[]>((observer) => {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const bitacoras: Bitacora[] = [];
          snapshot.forEach((doc) => {
            bitacoras.push({ id: doc.id, ...doc.data() } as Bitacora);
          });
          observer.next(bitacoras);
        },
        (error) => {
          observer.error(error);
        }
      );
      
      // Limpia la suscripción cuando el observable se destruye
      return () => unsubscribe();
    });
  }

  /**
   * Agrega una nueva entrada a la bitácora.
   */
  async addEntrada(bitacora: Bitacora): Promise<string> {
    const bitacorasRef = collection(this.firestore, this.collectionName);
    const docRef = await addDoc(bitacorasRef, bitacora);
    return docRef.id;
  }
}
