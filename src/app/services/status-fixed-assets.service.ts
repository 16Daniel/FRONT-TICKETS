import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EstatusActivoFijo } from '../models/estatus-activo-fijo.model';
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
export class StatusFixedAssetsService {
  pathName: string = 'cat_estatus_activos_fijos';

  constructor(private firestore: Firestore) { }

  async create(estatus: EstatusActivoFijo): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${estatus.id}`);

    const snapshot = await getDoc(documentRef);

    if (snapshot.exists()) {
      throw new Error(`El estatus con id ${estatus.id} ya existe.`);
    }

    await setDoc(documentRef, estatus);
  }

  get(): Observable<EstatusActivoFijo[]> {
    return new Observable<EstatusActivoFijo[]>((observer) => {
      const collectionRef = collection(this.firestore, this.pathName);

      // Arreglo para los filtros
      const constraints = [where('eliminado', '==', false)];

      const q = query(collectionRef, ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const estatus: EstatusActivoFijo[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<EstatusActivoFijo, 'id'>),
          }));

          estatus.sort((a, b) => Number(a.id) - Number(b.id));

          observer.next(estatus);
        },
        (error) => {
          console.error('Error en la suscripción:', error);
          observer.error(error);
        }
      );

      return { unsubscribe };
    });
  }

  async update(estatus: EstatusActivoFijo | any, idEstatusActivoFijo: string): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${idEstatusActivoFijo}`);
    return updateDoc(documentRef, estatus);
  }

  async delete(idEstatusActivoFijo: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${this.pathName}/${idEstatusActivoFijo}`);
      await updateDoc(docRef, {
        eliminado: true,
      });
    } catch (error) {
      console.error('Error al marcar como eliminado:', error);
    }
  }
}
