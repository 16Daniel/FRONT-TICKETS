import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, doc, Firestore, limit, onSnapshot, orderBy, query, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { Mantenimiento6x6AV } from '../models/mantenimiento-6x6-av.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Maintenance6x6AvService {
  pathName: string = 'mantenimientos-6x6-av';

  constructor(private firestore: Firestore) { }

  async create(mantenimiento: Mantenimiento6x6AV): Promise<void> {
    const mantenimientoRef = collection(this.firestore, this.pathName);
    await addDoc(mantenimientoRef, {
      ...mantenimiento,
      timestamp: Timestamp.now(), // Usa el timestamp de Firestore
    });
  }

  async update(id: string, mantenimiento: Mantenimiento6x6AV): Promise<void> {
    const mantenimientoRef = doc(this.firestore, `${this.pathName}/${id}`);
    await updateDoc(mantenimientoRef, {
      ...mantenimiento,
      timestamp: Timestamp.now(),
    });
  }

  getMantenimientoActivo(
    idSucursal: string | undefined,
    callback: (mantenimiento: Mantenimiento6x6AV | null) => void
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
        } as Mantenimiento6x6AV;
        callback(mantenimiento); // Devuelve el primer registro
      }
    });

    // Retorna la función para desuscribirse
    return unsubscribe;
  }

  getLastMaintenanceByBranch(idSucursal: string): Observable<Mantenimiento6x6AV[]> {
    const mantenimientoRef = collection(this.firestore, this.pathName);
    const q = query(
      mantenimientoRef,
      where('estatus', '==', false),
      where('idSucursal', '==', idSucursal),
      orderBy('fecha', 'desc'),
      limit(1)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Mantenimiento6x6AV[]>;
  }

  getHistorialMantenimeintos(
    fechaInicio: Date,
    fechaFin: Date,
    idSucursal: string,
    callback: (mantenimientos: Mantenimiento6x6AV[] | null) => void
  ): () => void {
    fechaInicio.setHours(0, 0, 0, 0);

    const mantenimientosRef = collection(this.firestore, this.pathName);

    const q = query(
      mantenimientosRef,
      where('fecha', '>=', fechaInicio),
      where('fecha', '<', new Date(fechaFin.getTime() + 24 * 60 * 60 * 1000)),
      where('idSucursal', '==', idSucursal),
      where('estatus', '==', false),
      orderBy('fecha', 'desc') // 🔥 Ordena por fecha descendente (más recientes primero)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        callback(null);
      } else {
        const primerDoc = querySnapshot.docs[0];
        const mantenimientos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Mantenimiento6x6AV[];
        callback(mantenimientos);
      }
    });

    return unsubscribe;
  }
}
