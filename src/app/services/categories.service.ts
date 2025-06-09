import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  Firestore,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria.mdoel';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  pathName: string = 'cat_categorias';

  constructor(private firestore: Firestore) {
  }

  async create(categoria: Categoria): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${categoria.id}`);

    const snapshot = await getDoc(documentRef);

    if (snapshot.exists()) {
      throw new Error(`La categoria con id ${categoria.id} ya existe.`);
    }

    await setDoc(documentRef, categoria);
  }

  get(idArea?: string): Observable<Categoria[]> {
    return new Observable<Categoria[]>((observer) => {
      const collectionRef = collection(this.firestore, this.pathName);

      // Arreglo para los filtros
      const constraints = [where('eliminado', '==', false)];
      if (idArea) {
        constraints.push(where('idArea', '==', parseInt(idArea)));
      }

      const q = query(collectionRef, ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const categorias: Categoria[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Categoria, 'id'>),
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

  async update(categoria: Categoria | any, idCategoria: string): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${idCategoria}`);
    return updateDoc(documentRef, categoria);
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

  getCategoriasprov(idprov: string): Observable<any[]> {
    const vcollection = collection(
      this.firestore,
      'cat_areas/' + idprov + '/cat_categorias'
    );
    return collectionData(vcollection, { idField: 'id' }); // Incluye el ID del documento
  }

  async getCategoria(idprov: string, docId: string): Promise<any> {
    const documentRef = doc(
      this.firestore,
      `/cat_areas/${idprov}/cat_categorias/${docId}`
    ); // Referencia al documento
    const documentSnapshot = await getDoc(documentRef); // Consulta única
    if (documentSnapshot.exists()) {
      return documentSnapshot.data(); // Retorna los datos del documento
    } else {
      throw new Error('Documento no encontrado');
    }
  }
}
