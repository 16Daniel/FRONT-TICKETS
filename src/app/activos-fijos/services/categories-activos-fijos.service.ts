import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoriaActivoFijo } from '../models/categoria-activo-fijo.model';
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
  providedIn: 'root'
})
export class CategoriesFixedAssetsService {
  pathName: string = 'cat_categorias_activos_fijos';

  constructor(private firestore: Firestore) { }

  async create(categoria: CategoriaActivoFijo): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${categoria.id}`);

    const snapshot = await getDoc(documentRef);

    if (snapshot.exists()) {
      throw new Error(`La categoria con id ${categoria.id} ya existe.`);
    }

    await setDoc(documentRef, categoria);
  }

  get(): Observable<CategoriaActivoFijo[]> {
    return new Observable<CategoriaActivoFijo[]>((observer) => {
      const collectionRef = collection(this.firestore, this.pathName);

      // Arreglo para los filtros
      const constraints = [where('eliminado', '==', false)];

      const q = query(collectionRef, ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const categorias: CategoriaActivoFijo[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<CategoriaActivoFijo, 'id'>),
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

  async update(categoria: CategoriaActivoFijo | any, idCategoria: string): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${idCategoria}`);
    return updateDoc(documentRef, categoria);
  }

  async delete(idCategoria: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${this.pathName}/${idCategoria}`);
      await updateDoc(docRef, {
        eliminado: true,
      });
    } catch (error) {
      console.error('Error al marcar como eliminado:', error);
    }
  }
}
