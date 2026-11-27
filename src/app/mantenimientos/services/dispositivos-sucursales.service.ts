import { Injectable } from '@angular/core';
import { doc, Firestore, getDoc, onSnapshot, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Dispositivo } from '../interfaces/dispositivo.model';
import { DispositivosSucursal } from '../models/dispositivos-sucursal.model';

@Injectable({
  providedIn: 'root',
})
export class DispositivosSucursalesService {
  private readonly pathName: string = 'dispositivos-sucursal';

  constructor(private firestore: Firestore) {}

  /**
   * Escucha en tiempo real el documento dispositivos-sucursal/{idSucursal}.
   * Usar String(idSucursal) como ID de documento evita duplicados y mantiene
   * sincronización en vivo sin problemas de string vs number.
   */
  getBySucursalId(idSucursal: number | string): Observable<DispositivosSucursal> {
    return new Observable<DispositivosSucursal>((observer) => {
      const idStr = String(idSucursal).trim();
      const docRef = doc(this.firestore, `${this.pathName}/${idStr}`);

      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<DispositivosSucursal>;
            observer.next({
              id: docSnap.id,
              idSucursal: idStr,
              dispositivos: Array.isArray(data.dispositivos) ? data.dispositivos : [],
            });
          } else {
            observer.next({
              id: idStr,
              idSucursal: idStr,
              dispositivos: [],
            });
          }
        },
        (error) => {
          console.error('Error al suscribirse a dispositivos-sucursal:', error);
          observer.error(error);
        }
      );

      return { unsubscribe };
    });
  }

  async getOnceBySucursalId(idSucursal: number | string): Promise<DispositivosSucursal | null> {
    const idStr = String(idSucursal).trim();
    const docRef = doc(this.firestore, `${this.pathName}/${idStr}`);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data() as Partial<DispositivosSucursal>;
    return {
      id: docSnap.id,
      idSucursal: idStr,
      dispositivos: Array.isArray(data.dispositivos) ? data.dispositivos : [],
    };
  }

  async saveOrUpdate(dispositivosSucursal: DispositivosSucursal): Promise<void> {
    const idStr = String(dispositivosSucursal.idSucursal).trim();
    const docRef = doc(this.firestore, `${this.pathName}/${idStr}`);

    const dispositivosLimpios = (dispositivosSucursal.dispositivos || []).map((d) => ({
      id: d.id,
      tipoId: d.tipoId,
      nombre: (d.nombre || '').trim(),
      estatus: d.estatus || '1',
      eliminado: Boolean(d.eliminado),
      marca: (d.marca || '').trim(),
      pulgadas: (d.pulgadas || '').trim(),
      modelo: (d.modelo || '').trim(),
      numeroSerie: (d.numeroSerie || '').trim(),
      comentarios: (d.comentarios || '').trim(),
    }));

    await setDoc(docRef, {
      idSucursal: idStr,
      dispositivos: dispositivosLimpios,
    });
  }

  obtenerPorTipo(
    dispositivosSucursal: DispositivosSucursal | null | undefined,
    tipoId: string
  ): Dispositivo[] {
    if (!dispositivosSucursal || !Array.isArray(dispositivosSucursal.dispositivos)) {
      return [];
    }
    return dispositivosSucursal.dispositivos.filter(
      (d) => !d.eliminado && d.tipoId === tipoId
    );
  }
}
