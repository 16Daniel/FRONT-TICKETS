import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
import { UbicacionActivoFijo } from '../interfaces/ubicacion-activo-fijo.model';

@Injectable({
  providedIn: 'root'
})

export class LocationsFixedAssetsService {
  pathName: string = 'cat_ubicaciones_activos_fijos';

  constructor(private firestore: Firestore) { }

  async create(ubicacion: UbicacionActivoFijo): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${ubicacion.id}`);

    const snapshot = await getDoc(documentRef);

    if (snapshot.exists()) {
      throw new Error(`La ubicación con id ${ubicacion.id} ya existe.`);
    }

    await setDoc(documentRef, ubicacion);
  }

  get(): Observable<UbicacionActivoFijo[]> {
    return new Observable<UbicacionActivoFijo[]>((observer) => {
      const collectionRef = collection(this.firestore, this.pathName);

      // Arreglo para los filtros
      const constraints = [where('eliminado', '==', false)];

      const q = query(collectionRef, ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const ubicaciones: UbicacionActivoFijo[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<UbicacionActivoFijo, 'id'>),
          }));

          ubicaciones.sort((a, b) => Number(a.id) - Number(b.id));

          observer.next(ubicaciones);
        },
        (error) => {
          console.error('Error en la suscripción:', error);
          observer.error(error);
        }
      );

      return { unsubscribe };
    });
  }

  async update(ubicacion: UbicacionActivoFijo | any, idUbicacion: string): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${idUbicacion}`);
    return updateDoc(documentRef, ubicacion);
  }

  async delete(idUbicacion: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${this.pathName}/${idUbicacion}`);
      await updateDoc(docRef, {
        eliminado: true,
      });
    } catch (error) {
      console.error('Error al marcar como eliminado:', error);
    }
  }
}
