import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Area } from '../models/area.model';
import {
  collection,
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

@Injectable({
  providedIn: 'root',
})
export class AreasService {
  pathName: string = 'cat_areas';

  constructor(private firestore: Firestore) { }

  async create(area: Area): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${area.id}`);

    const snapshot = await getDoc(documentRef);

    if (snapshot.exists()) {
      throw new Error(`El area con id ${area.id} ya existe.`);
    }

    await setDoc(documentRef, area);
  }

  get(): Observable<Area[]> {
    return new Observable<Area[]>((observer) => {
      const collectionRef = collection(this.firestore, this.pathName);

      // Arreglo para los filtros
      const constraints = [where('eliminado', '==', false)];

      const q = query(collectionRef, ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const areas: Area[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Area, 'id'>),
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

  async update(area: Area | any, idArea: string): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${idArea}`);
    return updateDoc(documentRef, area);
  }

  async delete(idArea: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${this.pathName}/${idArea}`);
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
      console.error('Error al obtener el count de areas:', error);
      throw error;
    }
  }
}
