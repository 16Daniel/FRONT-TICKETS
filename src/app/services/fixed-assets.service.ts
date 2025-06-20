import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivoFijo } from '../models/activo-fijo.model';
import {
  collection,
  doc,
  Firestore,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FixedAssetsService {
  pathName: string = 'activos_fijos';

  constructor(private firestore: Firestore) { }

  async create(activoFijo: ActivoFijo): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${activoFijo.id}`);

    const snapshot = await getDoc(documentRef);

    if (snapshot.exists()) {
      throw new Error(`El activo fijo con id ${activoFijo.id} ya existe.`);
    }

    await setDoc(documentRef, activoFijo);
  }

  get(): Observable<ActivoFijo[]> {
    return new Observable<ActivoFijo[]>((observer) => {
      const collectionRef = collection(this.firestore, this.pathName);

      // Arreglo para los filtros
      const constraints = [where('eliminado', '==', false)];

      const q = query(collectionRef, ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const activos: ActivoFijo[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<ActivoFijo, 'id'>),
          }));

          activos.sort((a, b) => Number(a.id) - Number(b.id));

          observer.next(activos);
        },
        (error) => {
          console.error('Error en la suscripción:', error);
          observer.error(error);
        }
      );

      return { unsubscribe };
    });
  }

  async update(activoFijo: ActivoFijo | any, idActivoFijo: string): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${idActivoFijo}`);
    return updateDoc(documentRef, activoFijo);
  }

  async delete(idActivoFijo: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${this.pathName}/${idActivoFijo}`);
      await updateDoc(docRef, {
        eliminado: true,
      });
    } catch (error) {
      console.error('Error al marcar como eliminado:', error);
    }
  }
}
