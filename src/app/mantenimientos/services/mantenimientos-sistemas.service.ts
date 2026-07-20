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
import { MantenimientoSys } from '../interfaces/mantenimiento-sys.interface';
import { CreateMantenimientoDto } from '../interfaces/create-mantenimeinto.interface';

@Injectable({
  providedIn: 'root',
})
export class MantenimientosSistemasService implements IMantenimientoService {
  pathName: string = 'mantenimientos-sistemas';

  constructor(private firestore: Firestore) { }

  async create(data: CreateMantenimientoDto): Promise<void> {

    const mantenimiento: MantenimientoSys = {
      idSucursal: data.idSucursal,
      idUsuarioSoporte: data.idUsuario,
      fecha: data.fecha,
      estatus: true,

      mantenimientoCaja: false,
      mantenimientoCCTV: false,
      mantenimientoImpresoras: false,
      mantenimientoInternet: false,
      mantenimientoNoBrakes: false,
      mantenimientoPuntosVentaTabletas: false,
      mantenimientoRack: false,
      mantenimientoTiemposCocina: false,

      observaciones: '',
      comentarios: [],

      participantesChat: data.participantesChat
    };

    const mantenimientoRef = collection(this.firestore, this.pathName);

    await addDoc(mantenimientoRef, {
      ...mantenimiento,
      timestamp: Timestamp.now(),
    });

  }

  calcularPorcentaje(mantenimiento: MantenimientoSys): number {
    if (!mantenimiento) return 0;

    const totalActividades = 8;
    let completadas = 0;
    if (mantenimiento.mantenimientoCaja) completadas++;
    if (mantenimiento.mantenimientoImpresoras) completadas++;
    if (mantenimiento.mantenimientoRack) completadas++;
    if (mantenimiento.mantenimientoPuntosVentaTabletas) completadas++;
    if (mantenimiento.mantenimientoInternet) completadas++;
    if (mantenimiento.mantenimientoCCTV) completadas++;
    if (mantenimiento.mantenimientoNoBrakes) completadas++;
    if (mantenimiento.mantenimientoTiemposCocina) completadas++;

    return Math.round((completadas / totalActividades) * 100);
  }

  get(): Observable<MantenimientoSys[]> {
    const mantenimientoRef = collection(this.firestore, this.pathName);
    const q = query(mantenimientoRef, where('estatus', '==', true));
    return collectionData(q, { idField: 'id' }) as Observable<MantenimientoSys[]>;
  }

  getById(id: string): Observable<MantenimientoSys | undefined> {
    return new Observable<MantenimientoSys | undefined>((subscriber) => {
      const mantenimientoRef = doc(this.firestore, `${this.pathName}/${id}`);

      const unsubscribe = onSnapshot(
        mantenimientoRef,
        (snapshot) => {
          if (snapshot.exists()) {
            subscriber.next({
              id: snapshot.id,
              ...snapshot.data(),
            } as MantenimientoSys);
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

  async update(id: string, mantenimiento: MantenimientoSys): Promise<void> {
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
    callback: (mantenimiento: MantenimientoSys | null) => void
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
        } as MantenimientoSys;
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
    callback: (mantenimientos: MantenimientoSys[] | null) => void
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
        })) as MantenimientoSys[];
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
          // where('estatus', '==', false),
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
    const documentos: MantenimientoSys[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as MantenimientoSys));

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
    const documentos: MantenimientoSys[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as MantenimientoSys));

    return documentos;
  }

  getLastMaintenanceByBranch(idSucursal: string): Observable<MantenimientoSys[]> {
    const mantenimientoRef = collection(this.firestore, this.pathName);
    const q = query(
      mantenimientoRef,
      where('estatus', '==', false),
      where('idSucursal', '==', idSucursal),
      orderBy('fecha', 'desc'),
      limit(1)
    );
    return collectionData(q, { idField: 'id' }) as Observable<MantenimientoSys[]>;
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
