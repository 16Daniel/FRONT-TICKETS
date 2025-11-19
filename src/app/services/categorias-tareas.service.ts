import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CategoriaTarea } from '../models/categoria-tarea.model';
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
export class CategoriasTareasService {
  private pathName: string = 'cat_categorias_tareas';

  private _categorias: CategoriaTarea[] = [];
  private _categoriasSubject = new BehaviorSubject<CategoriaTarea[]>([]);
  public categorias$: Observable<CategoriaTarea[]> = this._categoriasSubject.asObservable();

  private _unsubscribe: (() => void) | null = null;
  private _loaded: boolean = false;

  public get categorias(): CategoriaTarea[] {
    return this._categorias;
  }

  constructor(private firestore: Firestore) {
    this.initListener();
  }

  public initListener(): void {
    if (this._loaded) return;

    const collectionRef = collection(this.firestore, this.pathName);
    const q = query(collectionRef, where('eliminado', '==', false));

    this._unsubscribe = onSnapshot(q, (querySnapshot) => {
      this._categorias = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<CategoriaTarea, 'id'>),
      }));

      this._categoriasSubject.next(this._categorias);
      this._loaded = true;
    });
  }

  async create(categoria: CategoriaTarea): Promise<void> {
    if (!categoria.id) {
      throw new Error('La categoría debe tener un ID antes de crearse.');
    }

    const documentRef = doc(this.firestore, `${this.pathName}/${categoria.id}`);
    const snapshot = await getDoc(documentRef);

    if (snapshot.exists()) {
      throw new Error(`La categoría con id ${categoria.id} ya existe.`);
    }

    await setDoc(documentRef, categoria);
  }

  async update(categoria: Partial<CategoriaTarea>, idCategoria: string): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${idCategoria}`);
    return updateDoc(documentRef, categoria);
  }

  async delete(idCategoria: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${this.pathName}/${idCategoria}`);
      await updateDoc(docRef, { eliminado: true });
    } catch (error) {
      console.error('Error al marcar como eliminado:', error);
    }
  }

  async obtenerSecuencial(): Promise<string> {
    try {
      const collectionRef = collection(this.firestore, this.pathName);
      const snapshot = await getDocs(collectionRef);
      return (snapshot.size + 1).toString();
    } catch (error) {
      console.error('Error al obtener el count de categorías:', error);
      throw error;
    }
  }

  unsubscribe(): void {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }
}
