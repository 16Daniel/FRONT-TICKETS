import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  getDocs,
  onSnapshot,
} from '@angular/fire/firestore';
import { Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Mantenimiento10x10 } from '../models/mantenimiento-10x10.model';

@Injectable({
  providedIn: 'root',
})
export class Maintenance10x10Service {
  pathName: string = 'mantenimientos-10x10';

  constructor(private firestore: Firestore) {}

  async create(mantenimiento: Mantenimiento10x10): Promise<void> {
    const mantenimientoRef = collection(this.firestore, this.pathName);
    await addDoc(mantenimientoRef, {
      ...mantenimiento,
      timestamp: Timestamp.now(), // Usa el timestamp de Firestore
    });
  }

  get(): Observable<Mantenimiento10x10[]> {
    // const mantenimientoRef = collection(this.firestore, this.pathName);
    // return collectionData(mantenimientoRef, { idField: 'id' }) as Observable<
    //   Mantenimiento10x10[]
    // >;

    const mantenimientoRef = collection(this.firestore, this.pathName);
    const q = query(mantenimientoRef, where('estatus', '==', true));
    return collectionData(q, { idField: 'id' }) as Observable<Mantenimiento10x10[]>;
  }

  async getById(id: string): Promise<Mantenimiento10x10 | undefined> {
    const mantenimientoRef = doc(this.firestore, `${this.pathName}/${id}`);
    const snapshot = await getDoc(mantenimientoRef);
    return snapshot.exists()
      ? ({ id: snapshot.id, ...snapshot.data() } as Mantenimiento10x10)
      : undefined;
  }

  async update(id: string, mantenimiento: Mantenimiento10x10): Promise<void> {
    const mantenimientoRef = doc(this.firestore, `${this.pathName}/${id}`);
    await updateDoc(mantenimientoRef, {
      ...mantenimiento,
      timestamp: Timestamp.now(),
    });
  }

  async delete(id: string): Promise<void> {
    const mantenimientoRef = doc(this.firestore, `${this.pathName}/${id}`);
    await deleteDoc(mantenimientoRef);
  }

  getMantenimientoActivo(
    idSucursal: number,
    callback: (mantenimiento: Mantenimiento10x10 | null) => void
  ): () => void {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const mantenimientosRef = collection(this.firestore, this.pathName);

    const q = query(
      mantenimientosRef,
      where('fecha', '>=', hoy),
      where('fecha', '<', new Date(hoy.getTime() + 24 * 60 * 60 * 1000)), // Fecha menor que mañana a las 00:00:00
      where('idSucursal', '==', idSucursal),
      where('estatus', '==', true)
    );

    // Suscribirse a cambios en tiempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        callback(null); // No hay registros
      } else {
        const primerDoc = querySnapshot.docs[0];
        const mantenimiento = {
          id: primerDoc.id,
          ...primerDoc.data(),
        } as Mantenimiento10x10;
        callback(mantenimiento); // Devuelve el primer registro
      }
    });

    // Retorna la función para desuscribirse
    return unsubscribe;
  }
}
