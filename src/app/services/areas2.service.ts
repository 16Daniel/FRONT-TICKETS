import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
  private pathName: string = 'cat_areas';

  private _areas: Area[] = [];
  private _areasSubject = new BehaviorSubject<Area[]>([]);
  public areas$: Observable<Area[]> = this._areasSubject.asObservable();

  private _unsubscribe: (() => void) | null = null;
  private _loaded: boolean = false;
  public get areas(): Area[] {
    return this._areas;
  }

  constructor(private firestore: Firestore) {
    this.initListener();
  }

  public initListener(): void {
    if (this._loaded) return;

    const collectionRef = collection(this.firestore, this.pathName);
    const q = query(collectionRef, where('eliminado', '==', false));

    this._unsubscribe = onSnapshot(q, (querySnapshot) => {
      this._areas = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Area, 'id'>),
      }));
      this._areasSubject.next(this._areas);
      this._loaded = true;
    });
  }

  async create(area: Area): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${area.id}`);
    const snapshot = await getDoc(documentRef);

    if (snapshot.exists()) {
      throw new Error(`El área con id ${area.id} ya existe.`);
    }
    await setDoc(documentRef, area);
  }

  async update(area: Partial<Area>, idArea: string): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${idArea}`);
    return updateDoc(documentRef, area);
  }

  async delete(idArea: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${this.pathName}/${idArea}`);
      await updateDoc(docRef, { eliminado: true });
    } catch (error) {
      console.error('Error al marcar como eliminado:', error);
    }
  }

  async obtenerSecuencial(): Promise<number> {
    try {
      const collectionRef = collection(this.firestore, this.pathName);
      const snapshot = await getDocs(collectionRef);
      return snapshot.size + 1;
    } catch (error) {
      console.error('Error al obtener el count de áreas:', error);
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
