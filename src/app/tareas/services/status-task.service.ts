import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { collection, doc, Firestore, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { EstatusTarea } from '../interfaces/estatus-tarea.model';

@Injectable({
  providedIn: 'root'
})
export class StatusTaskService {
  private pathName: string = 'cat_estatus_tareas';

  private _estatus: EstatusTarea[] = [];
  private _estatusSubject = new BehaviorSubject<EstatusTarea[]>([]);
  public estatus$: Observable<EstatusTarea[]> = this._estatusSubject.asObservable();

  private _unsubscribe: (() => void) | null = null;
  private _loaded: boolean = false;
  public get estatus(): EstatusTarea[] {
    return this._estatus;
  }

  constructor(private firestore: Firestore) {
    this.initListener();
  }

  public initListener(): void {
    if (this._loaded) return;

    const collectionRef = collection(this.firestore, this.pathName);
    const q = query(collectionRef, where('eliminado', '==', false));

    this._unsubscribe = onSnapshot(q, (querySnapshot) => {
      this._estatus = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<EstatusTarea, 'id'>),
      }));
      this._estatusSubject.next(this._estatus);
      this._loaded = true;
    });
  }

  async create(estatus: EstatusTarea): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${estatus.id}`);
    const snapshot = await getDoc(documentRef);

    if (snapshot.exists()) {
      throw new Error(`El estatus con id ${estatus.id} ya existe.`);
    }
    await setDoc(documentRef, estatus);
  }

  async update(estatus: Partial<EstatusTarea>, idEstatus: string): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${idEstatus}`);
    return updateDoc(documentRef, estatus);
  }

  async delete(idEstatus: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${this.pathName}/${idEstatus}`);
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
      console.error('Error al obtener el count de estatus:', error);
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
