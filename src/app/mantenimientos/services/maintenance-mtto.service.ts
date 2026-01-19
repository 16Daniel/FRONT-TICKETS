import { Injectable } from '@angular/core';
import { addDoc, arrayUnion, collection, collectionData, deleteDoc, doc, Firestore, getDocs, limit, onSnapshot, orderBy, query, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { combineLatest, forkJoin, from, map, Observable } from 'rxjs';
import { IMantenimientoService } from '../interfaces/manteinance.interface';
import { MantenimientoMtto } from '../models/mantenimiento-mtto.model';
import { ParticipanteChat } from '../models/participante-chat.model';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceMtooService implements IMantenimientoService {
  pathName: string = 'mantenimientos-mtto';

  constructor(private firestore: Firestore) { }

  async create(idSucursal: string, idUsuario: string, fecha: Date, participantesChat: []): Promise<void> {
    const mantenimiento: MantenimientoMtto = {
      idSucursal: idSucursal.toString(),
      idUsuarioSoporte: idUsuario,
      idActivoFijo: '',
      descripcion: '',
      referencia: '',
      fecha,
      estatus: true,
      mantenimientoTermostato: true,
      mantenimientoPerillas: true,
      mantenimientoTornilleria: true,
      mantenimientoCableado: true,
      mantenimientoRuedas: true,
      mantenimientoTina: true,
      mantenimientoMangueras: true,
      mantenimientoLlavesDePaso: true,
      observaciones: '',
      comentarios: [],
      participantesChat
    };

    const mantenimientoRef = collection(this.firestore, this.pathName);
    await addDoc(mantenimientoRef, {
      ...mantenimiento,
      timestamp: Timestamp.now(), // Usa el timestamp de Firestore
    });
  }

  async create2(
    idSucursal: string,
    idUsuario: string,
    fecha: Date,
    idActivoFijo: string,
    descripcion: string,
    referencia: string,
    participantesChat: ParticipanteChat[]): Promise<void> {
    const mantenimiento: MantenimientoMtto = {
      idSucursal: idSucursal.toString(),
      idUsuarioSoporte: idUsuario,
      idActivoFijo,
      fecha,
      estatus: true,
      descripcion,
      referencia,
      mantenimientoTermostato: true,
      mantenimientoPerillas: true,
      mantenimientoTornilleria: true,
      mantenimientoCableado: true,
      mantenimientoRuedas: true,
      mantenimientoTina: true,
      mantenimientoMangueras: true,
      mantenimientoLlavesDePaso: true,
      observaciones: '',
      comentarios: [],
      participantesChat
    };

    const mantenimientoRef = collection(this.firestore, this.pathName);
    await addDoc(mantenimientoRef, {
      ...mantenimiento,
      timestamp: Timestamp.now(), // Usa el timestamp de Firestore
    });
  }

  calcularPorcentaje(mantenimiento: MantenimientoMtto) {
    if(!mantenimiento) return 0;

    let porcentaje = 0;
    mantenimiento.mantenimientoTermostato ? (porcentaje += 12.5) : porcentaje;
    mantenimiento.mantenimientoPerillas ? (porcentaje += 12.5) : porcentaje;
    mantenimiento.mantenimientoTornilleria ? (porcentaje += 12.5) : porcentaje;
    mantenimiento.mantenimientoRuedas
      ? (porcentaje += 12.5)
      : porcentaje;
    mantenimiento.mantenimientoCableado
      ? (porcentaje += 12.5)
      : porcentaje;
    mantenimiento.mantenimientoTina ? (porcentaje += 12.5) : porcentaje;
    mantenimiento.mantenimientoMangueras ? (porcentaje += 12.5) : porcentaje;
    mantenimiento.mantenimientoLlavesDePaso ? (porcentaje += 12.5) : porcentaje;

    return Math.round(porcentaje);
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
    const documentos: MantenimientoMtto[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as MantenimientoMtto));

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
    const documentos: MantenimientoMtto[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as MantenimientoMtto));

    return documentos;
  }

  getUltimoMantenimiento(idsSucursales: string[]): Observable<any[]> {
    const fechaActual = new Date();
    const fechaHaceUnMes = new Date(fechaActual);
    fechaHaceUnMes.setMonth(fechaHaceUnMes.getMonth() - 1);
    fechaHaceUnMes.setHours(0, 0, 0, 0);
    // Mapea cada sucursal a una consulta independiente
    const consultas = idsSucursales.map(idSucursal => {
      const mantenimientosRef = collection(this.firestore, this.pathName);
      const q = query(
        mantenimientosRef,
        where('idSucursal', '==', idSucursal),
        where('fecha', '>=', fechaHaceUnMes),
        where('estatus', '==', false),
        orderBy('fecha', 'desc'), // Ordena por fecha descendente
        limit(1) // Solo el más reciente
      );

      // Ejecutar la consulta y obtener los datos
      return from(getDocs(q)).pipe(
        map(querySnapshot => {
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() };
          }
          return null; // Si no hay mantenimientos para la sucursal
        })
      );
    });

    // Ejecutar todas las consultas en paralelo y combinar los resultados
    return forkJoin(consultas);
  }

  async update(id: string, mantenimiento: MantenimientoMtto): Promise<void> {
    const mantenimientoRef = doc(this.firestore, `${this.pathName}/${id}`);
    await updateDoc(mantenimientoRef, {
      ...mantenimiento,
      timestamp: Timestamp.now(),
    });
  }

  getMantenimientosActivosPorFecha(
    idSucursal: string | undefined,
    callback: (mantenimientos: MantenimientoMtto[]) => void
  ): () => void {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const mantenimientosRef = collection(this.firestore, this.pathName);

    const q = query(
      mantenimientosRef,
      where('fecha', '>=', hoy),
      where('fecha', '<', new Date(hoy.getTime() + 24 * 60 * 60 * 1000)),
      where('idSucursal', '==', idSucursal),
      where('estatus', '==', true)
    );

    // Suscribirse a cambios en tiempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const mantenimientos: MantenimientoMtto[] = [];

      querySnapshot.forEach((doc) => {
        mantenimientos.push({
          id: doc.id,
          ...doc.data(),
        } as MantenimientoMtto);
      });

      callback(mantenimientos); // Devuelve todos los resultados
    });

    return unsubscribe;
  }

  getLastMaintenanceByBranch(idSucursal: string): Observable<MantenimientoMtto[]> {
    const mantenimientoRef = collection(this.firestore, this.pathName);
    const q = query(
      mantenimientoRef,
      where('estatus', '==', false),
      where('idSucursal', '==', idSucursal),
      orderBy('fecha', 'desc'),
      limit(1)
    );
    return collectionData(q, { idField: 'id' }) as Observable<MantenimientoMtto[]>;
  }

  getHistorialMantenimeintos(
    fechaInicio: Date,
    fechaFin: Date,
    idSucursal: string,
    callback: (mantenimientos: MantenimientoMtto[] | null) => void
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
        })) as MantenimientoMtto[];
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

  async delete(id: string): Promise<void> {
    const mantenimientoRef = doc(this.firestore, `${this.pathName}/${id}`);
    await deleteDoc(mantenimientoRef);
  }

  getById(id: string): Observable<MantenimientoMtto | undefined> {
    return new Observable<MantenimientoMtto | undefined>((subscriber) => {
      const mantenimientoRef = doc(this.firestore, `${this.pathName}/${id}`);

      const unsubscribe = onSnapshot(
        mantenimientoRef,
        (snapshot) => {
          if (snapshot.exists()) {
            subscriber.next({
              id: snapshot.id,
              ...snapshot.data(),
            } as MantenimientoMtto);
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
