import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EtiquetaTarea } from '../models/etiqueta-tarea.model';

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
export class LabelsTasksService {
  private pathName: string = 'cat_etiquetas_tarea';

  private _etiquetas: EtiquetaTarea[] = [];
  private _etiquetasSubject = new BehaviorSubject<EtiquetaTarea[]>([]);
  public etiquetas$: Observable<EtiquetaTarea[]> = this._etiquetasSubject.asObservable();

  private _unsubscribe: (() => void) | null = null;
  private _loaded: boolean = false;

  public get etiquetas(): EtiquetaTarea[] {
    return this._etiquetas;
  }

  constructor(private firestore: Firestore) {
    this.initListener();
  }

  public initListener(): void {
    if (this._loaded) return;

    const collectionRef = collection(this.firestore, this.pathName);
    const q = query(collectionRef, where('eliminado', '==', false));

    this._unsubscribe = onSnapshot(q, (querySnapshot) => {
      this._etiquetas = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<EtiquetaTarea, 'id'>),
      }));

      this._etiquetasSubject.next(this._etiquetas);
      this._loaded = true;
    });
  }

  async create(etiqueta: EtiquetaTarea): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${etiqueta.id}`);
    const snapshot = await getDoc(documentRef);

    if (snapshot.exists()) {
      throw new Error(`La etiqueta con id ${etiqueta.id} ya existe.`);
    }

    await setDoc(documentRef, etiqueta);
  }

  async update(etiqueta: Partial<EtiquetaTarea>, idEtiqueta: string): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${idEtiqueta}`);
    return updateDoc(documentRef, etiqueta);
  }

  async delete(idEtiqueta: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${this.pathName}/${idEtiqueta}`);
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
      console.error('Error al obtener el count de etiquetas:', error);
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
