import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivoFijo } from '../models/activo-fijo.model';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { MantenimientoActivoFijo } from '../models/mantenimiento-activo-fijo.model';

@Injectable({
  providedIn: 'root'
})
export class FixedAssetsService {
  pathName: string = 'activos_fijos';

  constructor(private firestore: Firestore) { }

  async create(activoFijo: ActivoFijo): Promise<void> {
    const collectionRef = collection(this.firestore, this.pathName);

    // Primero generamos una referencia con ID automático
    const docRef = await addDoc(collectionRef, {
      ...activoFijo,
      id: '', // Se pone temporalmente para evitar error si Firestore requiere estructura completa
    });

    // Luego actualizamos el documento con su propio ID
    await setDoc(docRef, { ...activoFijo, id: docRef.id });
  }

  get(idArea: string): Observable<ActivoFijo[]> {
    return new Observable<ActivoFijo[]>((observer) => {
      const collectionRef = collection(this.firestore, this.pathName);

      const constraints = [
        where('eliminado', '==', false),
        where('idArea', '==', idArea)
      ];

      const q = query(collectionRef, ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const activos: ActivoFijo[] = querySnapshot.docs.map((doc) => {
            const data = doc.data() as Omit<ActivoFijo, 'id'>;

            // Filtrar mantenimientos (si existen)
            const mantenimientosFiltrados = (data.mantenimientos || []).filter(m => !m.eliminado);

            return {
              id: doc.id,
              ...data,
              mantenimientos: mantenimientosFiltrados
            };
          });

          activos.sort((a, b) => Number(a.id) - Number(b.id));

          observer.next(activos);
        },
        (error) => {
          console.error('Error en la suscripción:', error);
          observer.error(error);
        }
      );

      return { unsubscribe };
    });
  }

  async update(activoFijo: ActivoFijo | any, idActivoFijo: string): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${idActivoFijo}`);
    return updateDoc(documentRef, activoFijo);
  }

  async delete(idActivoFijo: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${this.pathName}/${idActivoFijo}`);
      await updateDoc(docRef, {
        eliminado: true,
      });
    } catch (error) {
      console.error('Error al marcar como eliminado:', error);
    }
  }

  async obtenerSecuencial(
    idArea: string,
    idSucursal: string,
    idAreaActivoFijo: string,
    idCategoriaActivoFijo: string
  ): Promise<number> {
    const docId = `${idSucursal}_${idArea}_${idAreaActivoFijo}_${idCategoriaActivoFijo}`;
    const docRef = doc(this.firestore, 'consecutivos-activos', docId);

    return await runTransaction(this.firestore, async (transaction) => {
      const docSnap = await transaction.get(docRef);

      let nuevoConsecutivo = 1;
      if (docSnap.exists()) {
        const data: any = docSnap.data();
        nuevoConsecutivo = data.ultimoConsecutivo + 1;
      }

      transaction.set(docRef, {
        idSucursal,
        idArea,
        idAreaActivoFijo,
        idCategoriaActivoFijo,
        ultimoConsecutivo: nuevoConsecutivo,
      });

      return nuevoConsecutivo;
    });
  }


  getByReference(referencia: string): Observable<ActivoFijo | undefined> {
    return new Observable<ActivoFijo | undefined>((observer) => {
      const collectionRef = collection(this.firestore, this.pathName);

      const constraints = [
        where('eliminado', '==', false),
        where('referencia', '==', referencia)
      ];

      const q = query(collectionRef, ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0]; // Solo el primero
            const activo: ActivoFijo = {
              id: docSnap.id,
              ...(docSnap.data() as Omit<ActivoFijo, 'id'>),
            };
            observer.next(activo);
          } else {
            observer.next(undefined); // No encontrado
          }
        },
        (error) => {
          console.error('Error en la suscripción:', error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    });
  }

  getByReferencePromise(referencia: string): Promise<ActivoFijo | undefined> {
    const collectionRef = collection(this.firestore, this.pathName);

    const constraints = [
      where('eliminado', '==', false),
      where('referencia', '==', referencia)
    ];

    const q = query(collectionRef, ...constraints);

    return getDocs(q)
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0]; // Solo el primero
          const activo: ActivoFijo = {
            id: docSnap.id,
            ...(docSnap.data() as Omit<ActivoFijo, 'id'>),
          };
          return activo;
        } else {
          return undefined;
        }
      })
      .catch((error) => {
        console.error('Error al obtener el documento por referencia:', error);
        throw error;
      });
  }

  async addMantenimiento(idActivoFijo: string, mantenimiento: MantenimientoActivoFijo): Promise<MantenimientoActivoFijo | null> {
    const documentRef = doc(this.firestore, `${this.pathName}/${idActivoFijo}`);

    // Generar ID único si no viene
    mantenimiento.id = mantenimiento.id || doc(collection(this.firestore, 'temp')).id;

    // Obtener el documento actual
    const snapshot = await getDocs(query(collection(this.firestore, this.pathName), where('id', '==', idActivoFijo)));
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data() as ActivoFijo;
      const mantenimientos = data.mantenimientos || [];

      mantenimientos.push(mantenimiento);

      await updateDoc(documentRef, { mantenimientos });

      return mantenimiento;
    }

    return null; // En caso de que no se encuentre el documento
  }

  async deleteMantenimiento(idActivoFijo: string, idMantenimiento: string): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${idActivoFijo}`);

    // Buscar el activo por id
    const snapshot = await getDocs(query(collection(this.firestore, this.pathName), where('id', '==', idActivoFijo)));
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data() as ActivoFijo;
      const mantenimientos = data.mantenimientos || [];

      // Buscar y marcar como eliminado
      const nuevosMantenimientos = mantenimientos.map(m => {
        if (m.id === idMantenimiento) {
          return { ...m, eliminado: true }; // Marcar como eliminado
        }
        return m;
      });

      await updateDoc(documentRef, { mantenimientos: nuevosMantenimientos });
    }
  }

  async obtenerFredioras(idSucursal: string): Promise<ActivoFijo[]> {
    try {
      const collectionRef = collection(this.firestore, this.pathName);
      const q = query(
        collectionRef,
        where('idSucursal', '==', idSucursal),
        where('esFreidora', '==', true),
        where('eliminado', '==', false)
      );
      const snapshot = await getDocs(q);
      const freidoras: ActivoFijo[] = [];

      snapshot.forEach((doc) => {
        freidoras.push(doc.data() as ActivoFijo);
      });

      return freidoras;
    } catch (error) {
      console.error('Error al obtener las freidoras:', error);
      throw error;
    }
  }
}
