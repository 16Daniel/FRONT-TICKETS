import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  Firestore,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  docData,
  getDocs,
  QueryConstraint,
} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
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
    const q = query(
      ref,
      where('eliminado', '==', false),
      // orderBy('fecha', 'desc')
      orderBy('orden', 'asc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Tarea[]>;
  }

  getBySucursal(idSucursal: string): Observable<Tarea[]> {
    const ref = collection(this.firestore, this.pathName);
    const q = query(
      ref,
      where('eliminado', '==', false),
      where('idSucursal', '==', idSucursal),
      // orderBy('fecha', 'desc')
      orderBy('orden', 'asc')
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map((tareas: any[]) =>
        tareas.map(t => ({
          ...t,
          fecha: t.fecha?.toDate ? t.fecha.toDate() : t.fecha,
          fechaFin: t.fechaFin?.toDate ? t.fechaFin.toDate() : t.fechaFin
        }))
      )
    ) as Observable<Tarea[]>;
  }

  getByEstatus(idEstatus: string): Observable<Tarea[]> {
    const ref = collection(this.firestore, this.pathName);
    const q = query(
      ref,
      where('eliminado', '==', false),
      where('idEstatus', '==', idEstatus),
      // orderBy('fecha', 'desc')
      orderBy('orden', 'asc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Tarea[]>;
  }

  getArchivedTasks(
    idSucursal: string,
    fechaInicio?: Date,
    fechaFin?: Date
  ): Observable<Tarea[]> {
    const ref = collection(this.firestore, this.pathName);

    const constraints: QueryConstraint[] = [
      where('eliminado', '==', false),
      where('idEstatus', '==', '5'),
      where('idSucursal', '==', idSucursal),
    ];

    if (fechaInicio) {
      constraints.push(where('fecha', '>=', fechaInicio));
    }

    if (fechaFin) {
      constraints.push(where('fecha', '<=', fechaFin));
    }

    constraints.push(orderBy('fecha', 'desc'));
    constraints.push(orderBy('orden', 'asc'));

    const q = query(ref, ...constraints);

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

  async normalizarOrden(): Promise<void> {
    const ref = collection(this.firestore, this.pathName);
    const q = query(ref, where('eliminado', '==', false));

    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as Tarea;

      if (data.orden === undefined) {
        await updateDoc(docSnap.ref, { orden: 0 });
      }
    }
  }

  getTareasPorResponsableGlobal(idResponsable: string): Observable<Tarea[]> {
    const ref = collection(this.firestore, this.pathName);
    const q = query(
      ref,
      where('eliminado', '==', false),
      where('idsResponsables', 'array-contains', idResponsable),
      orderBy('orden', 'asc')
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map((tareas: any[]) =>
        tareas.map(t => ({
          ...t,
          fecha: t.fecha?.toDate ? t.fecha.toDate() : t.fecha,
          fechaFin: t.fechaFin?.toDate ? t.fechaFin.toDate() : t.fechaFin
        }))
      )
    ) as Observable<Tarea[]>;
  }

}
