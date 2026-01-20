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
import { AreaActivoFijo } from '../interfaces/area-activo-fijo.model';

@Injectable({
  providedIn: 'root'
})
export class AreasFixedAssetsService {
  pathName: string = 'cat_areas_activos_fijos';

  constructor(private firestore: Firestore) { }

  async create(area: AreaActivoFijo): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${area.id}`);

    const snapshot = await getDoc(documentRef);

    if (snapshot.exists()) {
      throw new Error(`El area con id ${area.id} ya existe.`);
    }

    await setDoc(documentRef, area);
  }

  get(): Observable<AreaActivoFijo[]> {
    return new Observable<AreaActivoFijo[]>((observer) => {
      const collectionRef = collection(this.firestore, this.pathName);

      // Arreglo para los filtros
      const constraints = [where('eliminado', '==', false)];

      const q = query(collectionRef, ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const areas: AreaActivoFijo[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<AreaActivoFijo, 'id'>),
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

  async update(area: AreaActivoFijo | any, idArea: string): Promise<void> {
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
}
