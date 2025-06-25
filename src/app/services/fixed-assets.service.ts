import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivoFijo } from '../models/activo-fijo.model';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDocs,
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
    const collectionRef = collection(this.firestore, this.pathName);

    // Primero generamos una referencia con ID automático
    const docRef = await addDoc(collectionRef, {
      ...activoFijo,
      id: '', // Se pone temporalmente para evitar error si Firestore requiere estructura completa
    });

    // Luego actualizamos el documento con su propio ID
    await setDoc(docRef, { ...activoFijo, id: docRef.id });
  }

  get(idArea: string): Observable<ActivoFijo[]> {
    return new Observable<ActivoFijo[]>((observer) => {
      const collectionRef = collection(this.firestore, this.pathName);

      // Arreglo para los filtros
      const constraints = [
        where('eliminado', '==', false),
        where('idArea', '==', idArea)
      ];

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

  async obtenerSecuencial(
    idArea: string,
    idSucursal: string,
    idAreaActivoFijo: string,
    idCategoriaActivoFijo: string
  ): Promise<number> {
    try {
      const collectionRef = collection(this.firestore, this.pathName);
      const q = query(
        collectionRef,
        where('idArea', '==', idArea),
        where('idSucursal', '==', idSucursal),
        where('idAreaActivoFijo', '==', idAreaActivoFijo),
        where('idCategoriaActivoFijo', '==', idCategoriaActivoFijo)
      );
      const snapshot = await getDocs(q);
      const count = snapshot.size;
      return count + 1;
    } catch (error) {
      console.error('Error al obtener el count de documentos filtrados:', error);
      throw error;
    }
  }

  getByReference(referencia: string): Observable<ActivoFijo | undefined> {
    return new Observable<ActivoFijo | undefined>((observer) => {
      const collectionRef = collection(this.firestore, this.pathName);

      const constraints = [
        where('eliminado', '==', false),
        where('referencia', '==', referencia)
      ];

      const q = query(collectionRef, ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0]; // Solo el primero
            const activo: ActivoFijo = {
              id: docSnap.id,
              ...(docSnap.data() as Omit<ActivoFijo, 'id'>),
            };
            observer.next(activo);
          } else {
            observer.next(undefined); // No encontrado
          }
        },
        (error) => {
          console.error('Error en la suscripción:', error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    });
  }

}
