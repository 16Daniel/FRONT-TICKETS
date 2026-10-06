import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Responsable } from '../interfaces/responsable.interface';

@Injectable({
  providedIn: 'root',
})
export class ResponsablesService {

  private pathName = 'responsables';

  private _responsables: Responsable[] = [];
  private _responsablesSubject = new BehaviorSubject<Responsable[]>([]);
  public responsables$: Observable<Responsable[]> =
    this._responsablesSubject.asObservable();

  private _unsubscribe: (() => void) | null = null;
  private _loaded = false;

  public get responsables(): Responsable[] {
    return this._responsables;
  }

  constructor(private firestore: Firestore) {
    this.initListener();
  }

  public initListener(): void {
    if (this._loaded) return;

    const collectionRef = collection(this.firestore, this.pathName);
    const q = query(collectionRef, where('eliminado', '==', false));

    this._unsubscribe = onSnapshot(q, (querySnapshot) => {
      this._responsables = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Responsable, 'id'>),
      }));

      this._responsablesSubject.next(this._responsables);
      this._loaded = true;
    });
  }

  async create(responsable: Responsable): Promise<string> {
    const ref = collection(this.firestore, this.pathName);
    const docRef = await addDoc(ref, responsable);
    return docRef.id;
  }

  async update(
    responsable: Partial<Responsable>,
    idResponsable: string
  ): Promise<void> {
    const documentRef = doc(
      this.firestore,
      `${this.pathName}/${idResponsable}`
    );
    return updateDoc(documentRef, responsable);
  }

  async delete(idResponsable: string): Promise<void> {
    try {
      const docRef = doc(
        this.firestore,
        `${this.pathName}/${idResponsable}`
      );
      await updateDoc(docRef, { eliminado: true });
    } catch (error) {
      console.error('Error al eliminar responsable:', error);
    }
  }

  unsubscribe(): void {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
      this._loaded = false;
    }
  }

  public filtrarPorSucursal(
    idSucursal: string | null,
    globales: boolean = true
  ): Responsable[] {
    if (!idSucursal) return [];

    return this._responsables.filter(
      r =>
        r.idSucursal === idSucursal ||
        (globales && r.esGlobal)
    );
  }

  public filtrarGlobales(): Responsable[] {
    return this._responsables.filter(
      r => r.esGlobal === true
    );
  }

  public buscarPorPin(pin: string): Responsable | null {
    if (!pin) return null;

    return (
      this._responsables.find(
        r => r.pin === pin && r.eliminado === false
      ) || null
    );
  }

  async generarPinUnico(): Promise<string> {
    for (let i = 0; i < 10; i++) {
      const pin = Math.floor(1000 + Math.random() * 9000).toString();

      const q = query(
        collection(this.firestore, this.pathName),
        where('pin', '==', pin)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return pin; // ✅ PIN único encontrado
      }
    }

    throw new Error('No se pudo generar un PIN único después de varios intentos');
  }

  async correoExiste(correo: string): Promise<boolean> {
    if (!correo) return false;

    const q = query(
      collection(this.firestore, this.pathName),
      where('correo', '==', correo.toLowerCase()),
      where('eliminado', '==', false)
    );

    const snapshot = await getDocs(q);

    return !snapshot.empty;
  }

}
