import { Injectable } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
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
    const documentRef = doc(this.firestore, `${this.pathName}/${sucursal.id}`);

    const snapshot = await getDoc(documentRef);

    if (snapshot.exists()) {
      throw new Error(`La sucursal con id ${sucursal.id} ya existe.`);
    }

    await setDoc(documentRef, sucursal);
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
          const areas: Sucursal[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Sucursal, 'id'>),
          }));

          areas.sort((a, b) => Number(a.id) - Number(b.id));

          observer.next(areas);
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
    const documentRef = doc(this.firestore, `${this.pathName}/${idSucursal}`);
    return updateDoc(documentRef, sucursal);
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
