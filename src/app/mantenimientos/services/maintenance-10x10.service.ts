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
import { MantenimientoSysAv } from '../interfaces/mantenimiento-sys-av.interface';
import { ParticipanteChat } from '../../shared/interfaces/participante-chat.model';

@Injectable({
  providedIn: 'root',
})
export class Maintenance10x10Service implements IMantenimientoService {
  pathName: string = 'mantenimientos-10x10';
  pathNameAv: string = 'mantenimientos-sys-av';

  constructor(private firestore: Firestore) { }

  async create(idSucursal: string, idUsuario: string, fecha: Date, participantesChat: []): Promise<void> {
    const mantenimiento: MantenimientoSys = {
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

  async createAv(
    idSucursal: string,
    idUsuario: string,
    fecha: Date,
    tvs: any,
    bocinas: any,
    participantesChat: ParticipanteChat[]
  ): Promise<void> {
    const mantenimiento: MantenimientoSysAv = {
      idSucursal: idSucursal,
      idUsuarioSoporte: idUsuario,
      fecha: fecha,
      estatus: true,
      mantenimientoPantallasSoporte: false,
      mantenimientoSenalVideo: false,
      mantenimientoParametrosImagen: false,
      mantenimientoFuncionalBocinas: false,
      mantenimientoTransmisionAudio: false,
      mantenimientoOrdenamientoCableado: false,
      mantenimientoLimpiezaRack: false,
      mantenimientoElectrico: false,
      observaciones: '',
      comentarios: [],
      tvs,
      bocinas,
      participantesChat,
    };

    const mantenimientoRef = collection(this.firestore, this.pathNameAv);
    await addDoc(mantenimientoRef, {
      ...mantenimiento,
      timestamp: Timestamp.now(),
    });
  }


  calcularPorcentaje(mantenimiento: MantenimientoSys): number {
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

  async delete2(id: string): Promise<void> {
    const mantenimientoRef = doc(this.firestore, `${this.pathNameAv}/${id}`);
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
    const documentos: MantenimientoSys[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as MantenimientoSys));

    return documentos;
  }

  async obtenerMantenimientoVisitaPorFechaArea2(
    fecha: Date,
    idSucursal: string,
    estatus?: boolean
  ) {
    const coleccionRef = collection(this.firestore, this.pathNameAv);

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
