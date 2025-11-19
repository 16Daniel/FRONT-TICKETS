import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  Firestore,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  updateDoc,
  docData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Tarea } from '../models/tarea.model';

@Injectable({
  providedIn: 'root',
})
export class TareasService {
  private pathName: string = 'tareas';

  constructor(private firestore: Firestore) { }

  async create(tarea: Tarea): Promise<string> {
    const ref = collection(this.firestore, this.pathName);
    const docRef = await addDoc(ref, tarea);
    return docRef.id;
  }

  getAll(): Observable<Tarea[]> {
    const ref = collection(this.firestore, this.pathName);
    const q = query(ref, orderBy('fecha', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Tarea[]>;
  }

  getBySucursal(idSucursal: string): Observable<Tarea[]> {
    const ref = collection(this.firestore, this.pathName);
    const q = query(
      ref,
      where('idSucursal', '==', idSucursal),
      orderBy('fecha', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Tarea[]>;
  }

  getByEstatus(idEstatus: string): Observable<Tarea[]> {
    const ref = collection(this.firestore, this.pathName);
    const q = query(
      ref,
      where('idEstatus', '==', idEstatus),
      orderBy('fecha', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Tarea[]>;
  }

  getByCategoria(idCategoria: string): Observable<Tarea[]> {
    const ref = collection(this.firestore, this.pathName);
    const q = query(
      ref,
      where('idCategoria', '==', idCategoria),
      orderBy('fecha', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Tarea[]>;
  }

  getById(idTarea: string): Observable<Tarea> {
    const documentRef = doc(this.firestore, `${this.pathName}/${idTarea}`);
    return docData(documentRef, { idField: 'id' }) as Observable<Tarea>;
  }

  async update(tarea: Partial<Tarea>, idTarea: string): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${idTarea}`);
    return updateDoc(documentRef, tarea);
  }
}
