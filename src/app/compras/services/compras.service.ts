import { Injectable } from '@angular/core';
import { addDoc, collection, doc, Firestore, getDoc, onSnapshot, query, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { Compra } from '../interfaces/compra.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComprasService {
  pathName: string = 'compras';

  constructor(private firestore: Firestore) {
  }

  async create(compra: Compra) {
    const ref = collection(this.firestore, this.pathName);
    const docRef = await addDoc(ref, compra);
    return docRef.id; // Devolver el ID del documento creado
  }

  getByArea(idArea: string, fechaInicio?: Date, fechaFinal?: Date): Observable<Compra[]> {
    // Por default busca el mes actual
    if (!fechaInicio) {
      const now = new Date();
      fechaInicio = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    if (!fechaFinal) {
      const now = new Date();
      fechaFinal = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    return new Observable<Compra[]>((observer) => {
      const collectionRef = collection(this.firestore, this.pathName);

      // Arreglo para los filtros
      const constraints = [
        where('eliminado', '==', false),
        // where('idEstatusCompra', 'not-in', ['4', '5']),
        where('idArea', '==', idArea),
        where('fecha', '>=', Timestamp.fromDate(fechaInicio!)),
        where('fecha', '<=', Timestamp.fromDate(fechaFinal!))];

      const q = query(collectionRef, ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const categorias: Compra[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Compra, 'id'>),
          }));

          categorias.sort((a, b) => Number(a.id) - Number(b.id));

          observer.next(categorias);
        },
        (error) => {
          console.error('Error en la suscripción:', error);
          observer.error(error);
        }
      );

      return { unsubscribe };
    });
  }

  getByUser(idUsuario: string): Observable<Compra[]> {
    return new Observable<Compra[]>((observer) => {
      const collectionRef = collection(this.firestore, this.pathName);

      // Arreglo para los filtros
      const constraints = [
        where('eliminado', '==', false),
        where('idEstatusCompra', 'not-in', ['4', '5']),
        where('idUsuario', '==', idUsuario)];

      const q = query(collectionRef, ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const categorias: Compra[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Compra, 'id'>),
          }));

          categorias.sort((a, b) => Number(a.id) - Number(b.id));

          observer.next(categorias);
        },
        (error) => {
          console.error('Error en la suscripción:', error);
          observer.error(error);
        }
      );

      return { unsubscribe };
    });
  }

  async update(compra: Compra | any, idCompra: string): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${idCompra}`);
    return updateDoc(documentRef, compra);
  }

  async delete(idCompra: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${this.pathName}/${idCompra}`);
      await updateDoc(docRef, {
        eliminado: true,
      });
    } catch (error) {
      console.error('Error al marcar como eliminado:', error);
    }
  }
}
