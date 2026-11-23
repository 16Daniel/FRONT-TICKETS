import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  onSnapshot,
  query,
  setDoc,
  writeBatch,
} from '@angular/fire/firestore';
import { SoporteSucursal } from '../interfaces/soporte-sucursal.interface';

@Injectable({
  providedIn: 'root',
})
export class SoporteSucursalesService {
  private readonly pathName: string = 'soporte_sucursales';

  private _asignaciones: SoporteSucursal[] = [];
  private _asignacionesSubject = new BehaviorSubject<SoporteSucursal[]>([]);
  public soporteSucursales$: Observable<SoporteSucursal[]> =
    this._asignacionesSubject.asObservable();

  private _unsubscribe: (() => void) | null = null;
  private _loaded: boolean = false;

  public get asignaciones(): SoporteSucursal[] {
    return this._asignaciones;
  }

  constructor(private firestore: Firestore) {
    this.initListener();
  }

  public initListener(): void {
    if (this._loaded) return;

    const collectionRef = collection(this.firestore, this.pathName);
    const q = query(collectionRef);

    this._unsubscribe = onSnapshot(q, (querySnapshot) => {
      this._asignaciones = querySnapshot.docs.map((d) =>
        this.normalizarAsignacion(d.id, d.data() as Partial<SoporteSucursal>)
      );
      this._asignacionesSubject.next(this._asignaciones);
      this._loaded = true;
    });
  }

  private normalizarAsignacion(
    docId: string,
    raw: Partial<SoporteSucursal>
  ): SoporteSucursal {
    const idsCrudos = Array.isArray(raw.idsUsuarios)
      ? raw.idsUsuarios
      : raw.idUsuario
        ? [raw.idUsuario]
        : [];
    const idsUsuarios = Array.from(
      new Set(
        idsCrudos
          .filter((id) => id !== null && id !== undefined && String(id).trim() !== '')
          .map((id) => String(id))
      )
    );

    const candidatoResponsable = raw.idResponsable
      ? String(raw.idResponsable)
      : raw.idUsuario
        ? String(raw.idUsuario)
        : '';

    const idResponsable =
      candidatoResponsable && idsUsuarios.includes(candidatoResponsable)
        ? candidatoResponsable
        : idsUsuarios[0] || '';

    return {
      id: docId,
      idArea: raw.idArea !== undefined ? String(raw.idArea) : '',
      idSucursal: raw.idSucursal !== undefined ? String(raw.idSucursal) : '',
      idResponsable,
      idsUsuarios,
    };
  }

  private construirDocId(idArea: string | number, idSucursal: string | number): string {
    return `${String(idArea)}_${String(idSucursal)}`;
  }

  obtenerAsignacion(
    idSucursal: string | number,
    idArea: string | number
  ): SoporteSucursal | null {
    if (
      idSucursal === null ||
      idSucursal === undefined ||
      idSucursal === '' ||
      idArea === null ||
      idArea === undefined ||
      idArea === ''
    ) {
      return null;
    }

    return (
      this._asignaciones.find(
        (a) =>
          String(a.idArea) === String(idArea) &&
          String(a.idSucursal) === String(idSucursal)
      ) || null
    );
  }

  obtenerIdResponsable(
    idSucursal: string | number,
    idArea: string | number
  ): string | null {
    const asignacion = this.obtenerAsignacion(idSucursal, idArea);
    return asignacion?.idResponsable || null;
  }

  obtenerIdsUsuariosSoporte(
    idSucursal: string | number,
    idArea: string | number
  ): string[] {
    const asignacion = this.obtenerAsignacion(idSucursal, idArea);
    return asignacion ? [...asignacion.idsUsuarios] : [];
  }

  obtenerSucursalesPorAnalista(
    idUsuario: string,
    idArea?: string | number
  ): string[] {
    if (!idUsuario) return [];

    return this._asignaciones
      .filter((a) => {
        const pertenece = a.idsUsuarios.includes(String(idUsuario));
        const mismaArea =
          idArea !== undefined && idArea !== null && idArea !== ''
            ? String(a.idArea) === String(idArea)
            : true;
        return pertenece && mismaArea;
      })
      .map((a) => String(a.idSucursal));
  }

  obtenerDetalleSucursalesPorAnalista(
    idUsuario: string,
    idArea?: string | number
  ): { idSucursal: string; esPrincipal: boolean }[] {
    if (!idUsuario) return [];

    return this._asignaciones
      .filter((a) => {
        const pertenece = a.idsUsuarios.includes(String(idUsuario));
        const mismaArea =
          idArea !== undefined && idArea !== null && idArea !== ''
            ? String(a.idArea) === String(idArea)
            : true;
        return pertenece && mismaArea;
      })
      .map((a) => ({
        idSucursal: String(a.idSucursal),
        esPrincipal: String(a.idResponsable) === String(idUsuario),
      }));
  }

  async guardarSoporte(
    idArea: string | number,
    idSucursal: string | number,
    idsUsuarios: (string | number)[],
    idResponsable?: string | number | null
  ): Promise<void> {
    const idsLimpios = Array.from(
      new Set(
        (idsUsuarios || [])
          .filter((id) => id !== null && id !== undefined && String(id).trim() !== '')
          .map((id) => String(id))
      )
    );

    if (idsLimpios.length === 0) {
      await this.quitarSoporte(idArea, idSucursal);
      return;
    }

    const responsableSolicitado =
      idResponsable !== null && idResponsable !== undefined && String(idResponsable).trim() !== ''
        ? String(idResponsable)
        : '';

    const responsableFinal =
      responsableSolicitado && idsLimpios.includes(responsableSolicitado)
        ? responsableSolicitado
        : idsLimpios[0];

    const docId = this.construirDocId(idArea, idSucursal);
    const docRef = doc(this.firestore, `${this.pathName}/${docId}`);
    const payload: Omit<SoporteSucursal, 'id' | 'idUsuario'> = {
      idArea: String(idArea),
      idSucursal: String(idSucursal),
      idResponsable: responsableFinal,
      idsUsuarios: idsLimpios,
    };
    await setDoc(docRef, payload);
  }

  async quitarSoporte(
    idArea: string | number,
    idSucursal: string | number
  ): Promise<void> {
    const docId = this.construirDocId(idArea, idSucursal);
    const docRef = doc(this.firestore, `${this.pathName}/${docId}`);
    await deleteDoc(docRef);
  }

  async quitarSoporteDeUsuario(idUsuario: string): Promise<void> {
    if (!idUsuario) return;

    const uid = String(idUsuario);
    const asignacionesUsuario = this._asignaciones.filter((a) =>
      a.idsUsuarios.includes(uid)
    );
    if (asignacionesUsuario.length === 0) return;

    const batch = writeBatch(this.firestore);
    for (const asignacion of asignacionesUsuario) {
      const docId =
        asignacion.id ||
        this.construirDocId(asignacion.idArea, asignacion.idSucursal);
      const docRef = doc(this.firestore, `${this.pathName}/${docId}`);
      const idsRestantes = asignacion.idsUsuarios.filter((id) => id !== uid);

      if (idsRestantes.length === 0) {
        batch.delete(docRef);
      } else {
        const nuevoResponsable =
          asignacion.idResponsable === uid
            ? idsRestantes[0]
            : asignacion.idResponsable;
        batch.set(docRef, {
          idArea: String(asignacion.idArea),
          idSucursal: String(asignacion.idSucursal),
          idResponsable: nuevoResponsable,
          idsUsuarios: idsRestantes,
        });
      }
    }
    await batch.commit();
  }

  unsubscribe(): void {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
      this._loaded = false;
    }
  }
}
