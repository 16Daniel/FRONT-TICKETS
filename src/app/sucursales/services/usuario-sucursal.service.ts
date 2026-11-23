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
import {
  TipoUsuarioSucursal,
  UsuarioSucursal,
} from '../interfaces/usuario-sucursal.interface';

@Injectable({
  providedIn: 'root',
})
export class UsuarioSucursalService {
  private readonly pathName: string = 'usuario_sucursal';

  private _relaciones: UsuarioSucursal[] = [];
  private _relacionesSubject = new BehaviorSubject<UsuarioSucursal[]>([]);
  public usuarioSucursal$: Observable<UsuarioSucursal[]> =
    this._relacionesSubject.asObservable();

  private _unsubscribe: (() => void) | null = null;
  private _loaded: boolean = false;

  public get relaciones(): UsuarioSucursal[] {
    return this._relaciones;
  }

  constructor(private firestore: Firestore) {
    this.initListener();
  }

  public initListener(): void {
    if (this._loaded) return;

    const collectionRef = collection(this.firestore, this.pathName);
    const q = query(collectionRef);

    this._unsubscribe = onSnapshot(q, (querySnapshot) => {
      this._relaciones = querySnapshot.docs.map((d) =>
        this.normalizarRelacion(d.id, d.data() as Partial<UsuarioSucursal>)
      );
      this._relacionesSubject.next(this._relaciones);
      this._loaded = true;
    });
  }

  private normalizarRelacion(
    docId: string,
    raw: Partial<UsuarioSucursal>
  ): UsuarioSucursal {
    const idsCrudos = Array.isArray(raw.idsUsuarios) ? raw.idsUsuarios : [];
    const idsUsuarios = Array.from(
      new Set(
        idsCrudos
          .filter((id) => id !== null && id !== undefined && String(id).trim() !== '')
          .map((id) => String(id))
      )
    );

    const candidatoResponsable = raw.idResponsable
      ? String(raw.idResponsable)
      : '';

    const idResponsable =
      candidatoResponsable && idsUsuarios.includes(candidatoResponsable)
        ? candidatoResponsable
        : idsUsuarios[0] || '';

    return {
      id: docId,
      tipo: (raw.tipo || 'SOPORTE') as TipoUsuarioSucursal,
      idArea: raw.idArea !== undefined ? String(raw.idArea) : '',
      idSucursal: raw.idSucursal !== undefined ? String(raw.idSucursal) : '',
      idResponsable,
      idsUsuarios,
    };
  }

  private construirDocId(
    tipo: TipoUsuarioSucursal,
    idArea: string | number,
    idSucursal: string | number
  ): string {
    return `${tipo}_${String(idArea)}_${String(idSucursal)}`;
  }

  obtenerRelacion(
    tipo: TipoUsuarioSucursal,
    idSucursal: string | number,
    idArea: string | number
  ): UsuarioSucursal | null {
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
      this._relaciones.find(
        (r) =>
          r.tipo === tipo &&
          String(r.idArea) === String(idArea) &&
          String(r.idSucursal) === String(idSucursal)
      ) || null
    );
  }

  obtenerIdResponsable(
    tipo: TipoUsuarioSucursal,
    idSucursal: string | number,
    idArea: string | number
  ): string | null {
    const relacion = this.obtenerRelacion(tipo, idSucursal, idArea);
    return relacion?.idResponsable || null;
  }

  obtenerIdsUsuarios(
    tipo: TipoUsuarioSucursal,
    idSucursal: string | number,
    idArea: string | number
  ): string[] {
    const relacion = this.obtenerRelacion(tipo, idSucursal, idArea);
    return relacion ? [...relacion.idsUsuarios] : [];
  }

  obtenerSucursalesPorUsuario(
    tipo: TipoUsuarioSucursal,
    idUsuario: string,
    idArea?: string | number
  ): string[] {
    if (!idUsuario) return [];

    return this._relaciones
      .filter((r) => {
        const mismoTipo = r.tipo === tipo;
        const pertenece = r.idsUsuarios.includes(String(idUsuario));
        const mismaArea =
          idArea !== undefined && idArea !== null && idArea !== ''
            ? String(r.idArea) === String(idArea)
            : true;
        return mismoTipo && pertenece && mismaArea;
      })
      .map((r) => String(r.idSucursal));
  }

  obtenerDetalleSucursalesPorUsuario(
    tipo: TipoUsuarioSucursal,
    idUsuario: string,
    idArea?: string | number
  ): { idSucursal: string; esPrincipal: boolean }[] {
    if (!idUsuario) return [];

    return this._relaciones
      .filter((r) => {
        const mismoTipo = r.tipo === tipo;
        const pertenece = r.idsUsuarios.includes(String(idUsuario));
        const mismaArea =
          idArea !== undefined && idArea !== null && idArea !== ''
            ? String(r.idArea) === String(idArea)
            : true;
        return mismoTipo && pertenece && mismaArea;
      })
      .map((r) => ({
        idSucursal: String(r.idSucursal),
        esPrincipal: String(r.idResponsable) === String(idUsuario),
      }));
  }

  async guardarPorSucursal(
    tipo: TipoUsuarioSucursal,
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
      await this.quitarRelacion(tipo, idArea, idSucursal);
      return;
    }

    const responsableSolicitado =
      idResponsable !== null &&
      idResponsable !== undefined &&
      String(idResponsable).trim() !== ''
        ? String(idResponsable)
        : '';

    const responsableFinal =
      responsableSolicitado && idsLimpios.includes(responsableSolicitado)
        ? responsableSolicitado
        : idsLimpios[0];

    const docId = this.construirDocId(tipo, idArea, idSucursal);
    const docRef = doc(this.firestore, `${this.pathName}/${docId}`);
    const payload: Omit<UsuarioSucursal, 'id'> = {
      tipo,
      idArea: String(idArea),
      idSucursal: String(idSucursal),
      idResponsable: responsableFinal,
      idsUsuarios: idsLimpios,
    };
    await setDoc(docRef, payload);
  }

  async guardarSucursalesDeUsuario(
    tipo: TipoUsuarioSucursal,
    idArea: string | number,
    idUsuario: string,
    idsSucursales: (string | number)[]
  ): Promise<void> {
    if (!idUsuario || idArea === null || idArea === undefined || idArea === '') {
      return;
    }

    const uid = String(idUsuario);
    const areaStr = String(idArea);
    const seleccionadas = new Set(
      (idsSucursales || [])
        .filter((id) => id !== null && id !== undefined && String(id).trim() !== '')
        .map((id) => String(id))
    );

    const relacionesExistentes = this._relaciones.filter(
      (r) => r.tipo === tipo && String(r.idArea) === areaStr
    );
    const mapaPorSucursal = new Map<string, UsuarioSucursal>();
    for (const rel of relacionesExistentes) {
      mapaPorSucursal.set(String(rel.idSucursal), rel);
    }

    const batch = writeBatch(this.firestore);
    let hayCambios = false;

    // 1. Agregar al usuario en las sucursales seleccionadas donde aún no está
    for (const idSucursal of seleccionadas) {
      const existente = mapaPorSucursal.get(idSucursal);
      if (existente && existente.idsUsuarios.includes(uid)) {
        continue;
      }

      const idsUsuarios = existente
        ? Array.from(new Set([...existente.idsUsuarios, uid]))
        : [uid];
      const idResponsable =
        existente?.idResponsable && idsUsuarios.includes(existente.idResponsable)
          ? existente.idResponsable
          : idsUsuarios[0];

      const docId = this.construirDocId(tipo, areaStr, idSucursal);
      const docRef = doc(this.firestore, `${this.pathName}/${docId}`);
      batch.set(docRef, {
        tipo,
        idArea: areaStr,
        idSucursal,
        idResponsable,
        idsUsuarios,
      });
      hayCambios = true;
    }

    // 2. Quitar al usuario de las sucursales del mismo tipo+área que ya no están seleccionadas
    for (const existente of relacionesExistentes) {
      const idSucursal = String(existente.idSucursal);
      if (!existente.idsUsuarios.includes(uid) || seleccionadas.has(idSucursal)) {
        continue;
      }

      const docId =
        existente.id || this.construirDocId(tipo, areaStr, idSucursal);
      const docRef = doc(this.firestore, `${this.pathName}/${docId}`);
      const idsRestantes = existente.idsUsuarios.filter((id) => id !== uid);

      if (idsRestantes.length === 0) {
        batch.delete(docRef);
      } else {
        const nuevoResponsable =
          existente.idResponsable === uid
            ? idsRestantes[0]
            : existente.idResponsable;
        batch.set(docRef, {
          tipo,
          idArea: areaStr,
          idSucursal,
          idResponsable: nuevoResponsable,
          idsUsuarios: idsRestantes,
        });
      }
      hayCambios = true;
    }

    if (hayCambios) {
      await batch.commit();
    }
  }

  async quitarRelacion(
    tipo: TipoUsuarioSucursal,
    idArea: string | number,
    idSucursal: string | number
  ): Promise<void> {
    const docId = this.construirDocId(tipo, idArea, idSucursal);
    const docRef = doc(this.firestore, `${this.pathName}/${docId}`);
    await deleteDoc(docRef);
  }

  async quitarRelacionesDeUsuario(
    idUsuario: string,
    tipo?: TipoUsuarioSucursal
  ): Promise<void> {
    if (!idUsuario) return;

    const uid = String(idUsuario);
    const relacionesUsuario = this._relaciones.filter(
      (r) =>
        r.idsUsuarios.includes(uid) && (tipo ? r.tipo === tipo : true)
    );
    if (relacionesUsuario.length === 0) return;

    const batch = writeBatch(this.firestore);
    for (const relacion of relacionesUsuario) {
      const docId =
        relacion.id ||
        this.construirDocId(relacion.tipo, relacion.idArea, relacion.idSucursal);
      const docRef = doc(this.firestore, `${this.pathName}/${docId}`);
      const idsRestantes = relacion.idsUsuarios.filter((id) => id !== uid);

      if (idsRestantes.length === 0) {
        batch.delete(docRef);
      } else {
        const nuevoResponsable =
          relacion.idResponsable === uid
            ? idsRestantes[0]
            : relacion.idResponsable;
        batch.set(docRef, {
          tipo: relacion.tipo,
          idArea: String(relacion.idArea),
          idSucursal: String(relacion.idSucursal),
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
