import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { collection, doc, Firestore, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { EstatusEisenhower } from '../models/estatus-eisenhower.model';

@Injectable({
  providedIn: 'root'
})
export class StatusEisenhowerService {
  private pathName: string = 'cat_estatus_eisenhower';

  private _estatus: EstatusEisenhower[] = [];
  private _estatusSubject = new BehaviorSubject<EstatusEisenhower[]>([]);
  public estatus$: Observable<EstatusEisenhower[]> = this._estatusSubject.asObservable();

  private _unsubscribe: (() => void) | null = null;
  private _loaded: boolean = false;
  public get estatus(): EstatusEisenhower[] {
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
        ...(doc.data() as Omit<EstatusEisenhower, 'id'>),
      }));
      this._estatusSubject.next(this._estatus);
      this._loaded = true;
    });
  }

  async create(estatus: EstatusEisenhower): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${estatus.id}`);
    const snapshot = await getDoc(documentRef);

    if (snapshot.exists()) {
      throw new Error(`El estatus con id ${estatus.id} ya existe.`);
    }
    await setDoc(documentRef, estatus);
  }

  async update(estatus: Partial<EstatusEisenhower>, idEstatus: string): Promise<void> {
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
