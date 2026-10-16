import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
import { Comite } from '../interfaces/comite';

@Injectable({
  providedIn: 'root',
})
export class ComitesService 
{
    private pathName: string = 'cat_comites';
  
    private _comites: Comite[] = [];
    private _comitesSubject = new BehaviorSubject<Comite[]>([]);
    public comites$: Observable<Comite[]> = this._comitesSubject.asObservable();
  
    private _unsubscribe: (() => void) | null = null;
    private _loaded: boolean = false;
    public get comites(): Comite[] {
      return this._comites;
    }
  
    constructor(private firestore: Firestore) {
      this.initListener();
    }
  
    public initListener(): void {
      if (this._loaded) return;
  
      const collectionRef = collection(this.firestore, this.pathName);
      const q = query(collectionRef, where('eliminado', '==', false));
  
      this._unsubscribe = onSnapshot(q, (querySnapshot) => {
        this._comites = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Comite, 'id'>),
        }));
        this._comitesSubject.next(this._comites);
        this._loaded = true;
      });
    }
  
    async create(comite: Comite): Promise<void> {
      const documentRef = doc(this.firestore, `${this.pathName}/${comite.id}`);
      const snapshot = await getDoc(documentRef);
  
      if (snapshot.exists()) {
        throw new Error(`El comité con id ${comite.id} ya existe.`);
      }
      await setDoc(documentRef, comite);
    }
  
    async update(comite: Partial<Comite>, idComite: string): Promise<void> {
      const documentRef = doc(this.firestore, `${this.pathName}/${idComite}`);
      return updateDoc(documentRef, comite);
    }
  
    async delete(idComite: string): Promise<void> {
      const docRef = doc(this.firestore, `${this.pathName}/${idComite}`);
      await updateDoc(docRef, { eliminado: true });
    }
  
    async obtenerSecuencial(): Promise<string> {
      try {
        const collectionRef = collection(this.firestore, this.pathName);
        const snapshot = await getDocs(collectionRef);
        return (snapshot.size + 1).toString();
      } catch (error) {
        console.error('Error al obtener el count de comités:', error);
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
