import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, getDocs, limit, onSnapshot, orderBy, query, setDoc, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { forkJoin, from, map, Observable } from 'rxjs';
import { IMantenimientoService } from '../interfaces/manteinance.interface';
import { MantenimientoMtto } from '../models/mantenimiento-mtto.model';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceMtooService implements IMantenimientoService {
  pathName: string = 'mantenimientos-mtto';

  constructor(private firestore: Firestore) { }

  async create(idSucursal: string, idUsuario: string, fecha: Date): Promise<void> {
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
    referencia: string): Promise<void> {
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
    };

    const mantenimientoRef = collection(this.firestore, this.pathName);
    await addDoc(mantenimientoRef, {
      ...mantenimiento,
      timestamp: Timestamp.now(), // Usa el timestamp de Firestore
    });
  }

  calcularPorcentaje(mantenimiento: MantenimientoMtto) {
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

  async obtenerMantenimientoVisitaPorFecha(
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

  // getUltimos3Mantenimientos(idsSucursales: string[]): Observable<any[]> {
  //   // Mapea cada sucursal a una consulta independiente
  //   const consultas = idsSucursales.map(idSucursal => {
  //     const mantenimientosRef = collection(this.firestore, this.pathName);
  //     const q = query(
  //       mantenimientosRef,
  //       where('idSucursal', '==', idSucursal.toString()),
  //       where('estatus', '==', false),
  //       orderBy('fecha', 'desc'), // Ordena por fecha descendente
  //       limit(3)
  //     );

  //     // Ejecutar la consulta y obtener los datos
  //     return from(getDocs(q)).pipe(
  //       map(querySnapshot => {
  //         if (!querySnapshot.empty) {
  //           return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  //         }
  //         return []; // Si no hay documentos, devuelve un array vacío
  //       })
  //     );
  //   });

  //   // Ejecutar todas las consultas en paralelo y combinar los resultados
  //   return forkJoin(consultas);
  // }

  async delete(id: string): Promise<void> {
    const mantenimientoRef = doc(this.firestore, `${this.pathName}/${id}`);
    await deleteDoc(mantenimientoRef);
  }
}
