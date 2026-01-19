import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  docData,
  Firestore,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Sucursal } from '../models/sucursal.model';

@Injectable({
  providedIn: 'root',
})
export class BranchesService {
  pathName: string = 'cat_sucursales';

  constructor(private firestore: Firestore) { }

  async create(sucursal: Sucursal): Promise<void> {
    const data = this.serializeSucursal(sucursal);

    const documentRef = doc(this.firestore, `${this.pathName}/${sucursal.id}`);

    const snapshot = await getDoc(documentRef);

    if (snapshot.exists()) {
      throw new Error(`La sucursal con id ${sucursal.id} ya existe.`);
    }

    await setDoc(documentRef, data);
  }

  getById(id: string): Observable<Sucursal> {
    const ticketDoc = doc(this.firestore, `${this.pathName}/${id}`);
    return docData(ticketDoc, { idField: 'id' }) as Observable<Sucursal>;
  }

  async getOnce(): Promise<Sucursal[]> {
    try {
      const collectionRef = collection(this.firestore, this.pathName);
      const constraints = [where('eliminado', '==', false)];
      const q = query(collectionRef, ...constraints);

      const querySnapshot = await getDocs(q);

      const areas: Sucursal[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Sucursal, 'id'>),
      }));

      areas.sort((a, b) => Number(a.id) - Number(b.id));

      return areas;
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      throw error; // Puedes manejar el error según tus necesidades
    }
  }

  get(): Observable<Sucursal[]> {
    return new Observable<Sucursal[]>((observer) => {
      const collectionRef = collection(this.firestore, this.pathName);

      // Arreglo para los filtros
      const constraints = [where('eliminado', '==', false)];

      const q = query(collectionRef, ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const sucursales: Sucursal[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Sucursal, 'id'>),
          }));

          sucursales.sort((a, b) => Number(a.id) - Number(b.id));

          observer.next(sucursales.map((item: any) => ({
            ...item,
            id: item.id.toString()
          })));
        },
        (error) => {
          console.error('Error en la suscripción:', error);
          observer.error(error);
        }
      );

      return { unsubscribe };
    });
  }

  async update(sucursal: Sucursal | any, idSucursal: string): Promise<void> {
    const data = this.serializeSucursal(sucursal);
    const documentRef = doc(this.firestore, `${this.pathName}/${idSucursal}`);
    return updateDoc(documentRef, data);
  }

  private serializeSucursal(sucursal: Sucursal): any {
    return {
      ...sucursal,
      tabletas: sucursal.tabletas!.map(t => ({ ...t })),
      tpvs: sucursal.tpvs!.map(t => ({ ...t }))
    };
  }

  async updateMultiple(sucursales: Sucursal[]): Promise<void> {
    const batch = writeBatch(this.firestore);

    sucursales.forEach(item => {
      const documentRef = doc(this.firestore, `${this.pathName}/${item.id}`);
      batch.update(documentRef, item as any);
    });

    return batch.commit();
  }

  async delete(idSucursal: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${this.pathName}/${idSucursal}`);
      await updateDoc(docRef, {
        eliminado: true,
      });
    } catch (error) {
      console.error('Error al marcar como eliminado:', error);
    }
  }

  async obtenerSecuencial(): Promise<number> {
    try {
      const collectionRef = collection(this.firestore, this.pathName);
      const snapshot = await getDocs(collectionRef);
      const count = snapshot.size;
      return count + 1;
    } catch (error) {
      console.error('Error al obtener el count de sucursales:', error);
      throw error;
    }
  }
}
