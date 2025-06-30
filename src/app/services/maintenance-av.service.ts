import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, doc, Firestore, getDocs, limit, onSnapshot, orderBy, query, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { Mantenimiento6x6AV } from '../models/mantenimiento-av.model';
import { forkJoin, from, map, Observable } from 'rxjs';
import { IMantenimientoService } from '../interfaces/manteinance.interface';

@Injectable({
  providedIn: 'root'
})
export class Maintenance6x6AvService implements IMantenimientoService {
  pathName: string = 'mantenimientos-av';

  constructor(private firestore: Firestore) { }

  async create(idSucursal: string, idUsuario: string, fecha: Date): Promise<void> {
    const mantenimiento: Mantenimiento6x6AV = {
      idSucursal,
      idUsuarioSoporte: idUsuario,
      fecha,
      estatus: true,
      mantenimientoConexiones: true,
      mantenimientoCableado: true,
      mantenimientoRack: true,
      mantenimientoControles: true,
      mantenimientoNivelAudio: true,
      mantenimientoCanales: true,
      observaciones: '',
    };

    const mantenimientoRef = collection(this.firestore, this.pathName);
    await addDoc(mantenimientoRef, {
      ...mantenimiento,
      timestamp: Timestamp.now(), // Usa el timestamp de Firestore
    });
  }

  calcularPorcentaje(mantenimiento: Mantenimiento6x6AV) {
    let porcentaje = 0;
    mantenimiento.mantenimientoConexiones ? (porcentaje += 16.67) : porcentaje;
    mantenimiento.mantenimientoCableado ? (porcentaje += 16.67) : porcentaje;
    mantenimiento.mantenimientoRack ? (porcentaje += 16.67) : porcentaje;
    mantenimiento.mantenimientoControles
      ? (porcentaje += 16.67)
      : porcentaje;
    mantenimiento.mantenimientoNivelAudio
      ? (porcentaje += 16.67)
      : porcentaje;
    mantenimiento.mantenimientoCanales ? (porcentaje += 16.67) : porcentaje;

    return Math.round(porcentaje);
  }

  async obtenerMantenimientoVisitaPorFecha(fecha: Date, idSucursal: string) {
    const coleccionRef = collection(this.firestore, this.pathName);

    // Convertir las fechas a timestamps de Firestore
    fecha.setHours(0, 0, 0, 0);
    const consulta = query(
      coleccionRef,
      where('fecha', '==', fecha),
      where('idSucursal', '==', idSucursal),
      where('estatus', '==', false),
    );

    const querySnapshot = await getDocs(consulta);
    const documentos: Mantenimiento6x6AV[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mantenimiento6x6AV));

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

  getUltimosMantenimientos(idsSucursales: string[]): Observable<any[]> {
    // Mapea cada sucursal a una consulta independiente
    const consultas = idsSucursales.map(idSucursal => {
      const mantenimientosRef = collection(this.firestore, this.pathName);
      const q = query(
        mantenimientosRef,
        where('idSucursal', '==', idSucursal.toString()),
        where('estatus', '==', false),
        orderBy('fecha', 'desc'), // Ordena por fecha descendente
        limit(3)
      );

      // Ejecutar la consulta y obtener los datos
      return from(getDocs(q)).pipe(
        map(querySnapshot => {
          if (!querySnapshot.empty) {
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          }
          return []; // Si no hay documentos, devuelve un array vacío
        })
      );
    });

    // Ejecutar todas las consultas en paralelo y combinar los resultados
    return forkJoin(consultas);
  }

  getUltimos3Mantenimientos(idsSucursales: string[]): Observable<any[]> {
    // Mapea cada sucursal a una consulta independiente
    const consultas = idsSucursales.map(idSucursal => {
      const mantenimientosRef = collection(this.firestore, this.pathName);
      const q = query(
        mantenimientosRef,
        where('idSucursal', '==', idSucursal.toString()),
        where('estatus', '==', false),
        orderBy('fecha', 'desc'), // Ordena por fecha descendente
        limit(3)
      );

      // Ejecutar la consulta y obtener los datos
      return from(getDocs(q)).pipe(
        map(querySnapshot => {
          if (!querySnapshot.empty) {
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          }
          return []; // Si no hay documentos, devuelve un array vacío
        })
      );
    });

    // Ejecutar todas las consultas en paralelo y combinar los resultados
    return forkJoin(consultas);
  }
}
