import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
  arrayUnion,
} from '@angular/fire/firestore';
import { Timestamp } from '@angular/fire/firestore';
import { combineLatest, Observable } from 'rxjs';
import { IMantenimientoService } from '../interfaces/manteinance.interface';
import { Mantenimiento10x10 } from '../interfaces/mantenimiento-10x10.interface';

@Injectable({
  providedIn: 'root',
})
export class Maintenance10x10Service implements IMantenimientoService {
  pathName: string = 'mantenimientos-10x10';

  constructor(private firestore: Firestore) { }

  async create(idSucursal: string, idUsuario: string, fecha: Date, participantesChat: []): Promise<void> {
    const mantenimiento: Mantenimiento10x10 = {
      idSucursal: idSucursal,
      idUsuarioSoporte: idUsuario,
      fecha: fecha,
      estatus: true,
      mantenimientoCaja: false,
      mantenimientoCCTV: false,
      mantenimientoConcentradorApps: false,
      mantenimientoContenidosSistemaCable: false,
      mantenimientoImpresoras: false,
      mantenimientoInternet: false,
      mantenimientoNoBrakes: false,
      mantenimientoPuntosVentaTabletas: false,
      mantenimientoRack: false,
      mantenimientoTiemposCocina: false,
      observaciones: '',
      comentarios: [],
      participantesChat
    };

    const mantenimientoRef = collection(this.firestore, this.pathName);
    await addDoc(mantenimientoRef, {
      ...mantenimiento,
      timestamp: Timestamp.now(),
    });
  }

  calcularPorcentaje(mantenimiento: Mantenimiento10x10): number {
    if (!mantenimiento) return 0;

    let porcentaje = 0;
    mantenimiento.mantenimientoCaja ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoImpresoras ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoRack ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoPuntosVentaTabletas
      ? (porcentaje += 10)
      : porcentaje;
    mantenimiento.mantenimientoContenidosSistemaCable
      ? (porcentaje += 10)
      : porcentaje;
    mantenimiento.mantenimientoInternet ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoCCTV ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoNoBrakes ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoTiemposCocina ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoConcentradorApps
      ? (porcentaje += 10)
      : porcentaje;

    return porcentaje;
  }

  get(): Observable<Mantenimiento10x10[]> {
    const mantenimientoRef = collection(this.firestore, this.pathName);
    const q = query(mantenimientoRef, where('estatus', '==', true));
    return collectionData(q, { idField: 'id' }) as Observable<Mantenimiento10x10[]>;
  }

  getById(id: string): Observable<Mantenimiento10x10 | undefined> {
    return new Observable<Mantenimiento10x10 | undefined>((subscriber) => {
      const mantenimientoRef = doc(this.firestore, `${this.pathName}/${id}`);

      const unsubscribe = onSnapshot(
        mantenimientoRef,
        (snapshot) => {
          if (snapshot.exists()) {
            subscriber.next({
              id: snapshot.id,
              ...snapshot.data(),
            } as Mantenimiento10x10);
          } else {
            subscriber.next(undefined);
          }
        },
        (error) => subscriber.error(error)
      );

      // limpiar suscripción al destruir
      return () => unsubscribe();
    });
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
    idSucursal: string | undefined,
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

  getHistorialMantenimeintos(
    fechaInicio: Date,
    fechaFin: Date,
    idSucursal: string,
    callback: (mantenimientos: Mantenimiento10x10[] | null) => void
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
        })) as Mantenimiento10x10[];
        callback(mantenimientos);
      }
    });

    return unsubscribe;
  }

  getUltimosMantenimientos(idsSucursales: string[]): Observable<any[]> {
    // Creamos un Observable por cada sucursal
    const observables = idsSucursales.map(idSucursal => {
      return new Observable<any[]>(observer => {
        const mantenimientosRef = collection(this.firestore, this.pathName);
        const q = query(
          mantenimientosRef,
          where('idSucursal', '==', idSucursal.toString()),
          where('estatus', '==', false),
          orderBy('fecha', 'desc'),
          limit(3)
        );

        const unsubscribe = onSnapshot(q, snapshot => {
          const resultados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          observer.next(resultados);
        }, error => observer.error(error));

        // Limpiar suscripción cuando se complete
        return () => unsubscribe();
      });
    });

    // Combinamos todos los Observables para emitir un array con los resultados por sucursal
    return combineLatest(observables);
  }

  getMantenimientosPorSucursalYFecha(idsSucursales: string[], fecha: Date): Observable<any[]> {
    const observables = idsSucursales.map(idSucursal => {
      return new Observable<any[]>(observer => {
        const mantenimientosRef = collection(this.firestore, this.pathName);

        const q = query(
          mantenimientosRef,
          where('idSucursal', '==', idSucursal.toString()),
          where('estatus', '==', false),
          where('fecha', '==', fecha)
        );

        const unsubscribe = onSnapshot(
          q,
          snapshot => {
            const resultados = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            observer.next(resultados);
          },
          error => observer.error(error)
        );

        return () => unsubscribe();
      });
    });

    return combineLatest(observables);
  }

  async obtenerMantenimientoVisitaPorFechaArea(
    fecha: Date,
    idSucursal: string,
    estatus?: boolean
  ) {
    const coleccionRef = collection(this.firestore, this.pathName);

    // Convertir la fecha a las 00:00:00 del día
    fecha.setHours(0, 0, 0, 0);

    // Construir los filtros dinámicamente
    const filtros = [
      where('fecha', '==', fecha),
      where('idSucursal', '==', idSucursal),
    ];

    if (estatus !== undefined) {
      filtros.push(where('estatus', '==', estatus));
    }

    const consulta = query(coleccionRef, ...filtros);

    const querySnapshot = await getDocs(consulta);
    const documentos: Mantenimiento10x10[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Mantenimiento10x10));

    return documentos;
  }

  async obtenerMantenimientoVisitaPorFecha(
    fecha: Date,
    estatus?: boolean
  ) {
    const coleccionRef = collection(this.firestore, this.pathName);

    // Convertir la fecha a las 00:00:00 del día
    fecha.setHours(0, 0, 0, 0);

    // Construir los filtros dinámicamente
    const filtros = [
      where('fecha', '==', fecha),
    ];

    if (estatus !== undefined) {
      filtros.push(where('estatus', '==', estatus));
    }

    const consulta = query(coleccionRef, ...filtros);

    const querySnapshot = await getDocs(consulta);
    const documentos: Mantenimiento10x10[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Mantenimiento10x10));

    return documentos;
  }

  getLastMaintenanceByBranch(idSucursal: string): Observable<Mantenimiento10x10[]> {
    const mantenimientoRef = collection(this.firestore, this.pathName);
    const q = query(
      mantenimientoRef,
      where('estatus', '==', false),
      where('idSucursal', '==', idSucursal),
      orderBy('fecha', 'desc'),
      limit(1)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Mantenimiento10x10[]>;
  }

  async obtenerMantenimientosEntreFechas(
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<any[]> {
    const ticketsCollection = collection(this.firestore, this.pathName);

    const q = query(ticketsCollection,
      where('fecha', '>=', fechaInicio),
      where('fecha', '<', new Date(fechaFin.getTime() + 24 * 60 * 60 * 1000)),
      orderBy('fecha', 'desc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  updateLastCommentRead(
    idMantenimiento: string,
    idUsuario: string,
    ultimoComentarioLeido: number
  ) {
    const ticketRef = doc(this.firestore, `${this.pathName}/${idMantenimiento}`);

    // Actualizar el índice del último comentario leído para un participante
    return updateDoc(ticketRef, {
      participantesChat: arrayUnion({
        idUsuario,
        ultimoComentarioLeido,
      }),
    });
  }
}
