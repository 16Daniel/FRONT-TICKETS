import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  addDoc,
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
import { EtiquetaTarea } from '../interfaces/etiqueta-tarea.model';

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
  private _idAreaActual: string | null = null;

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

  async create(etiqueta: EtiquetaTarea) {
    const ref = collection(this.firestore, this.pathName);
    const docRef = await addDoc(ref, etiqueta);
    return docRef.id;
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

  public filtrarPorSucursal(idSucursal: string | null): EtiquetaTarea[] {
    if (!idSucursal) return [];

    return this._etiquetas.filter(
      et => et.idSucursal === idSucursal && et.eliminado === false
    );
  }

}
