import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  onSnapshot,
  query,
  updateDoc,
} from '@angular/fire/firestore';
import { Usuario } from '../models/usuario.model';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { UsuarioSucursalService } from '../../sucursales/services/usuario-sucursal.service';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  pathName: string = 'usuarios';

  private _usuarios: Usuario[] = [];
  private _usuariosSubject = new BehaviorSubject<Usuario[]>([]);
  public usuarios$: Observable<Usuario[]> = this._usuariosSubject.asObservable();

  private _unsubscribe: (() => void) | null = null;
  private _loaded: boolean = false;

  public get usuarios(): Usuario[] {
    return this._usuarios;
  }

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private usuarioSucursalService: UsuarioSucursalService
  ) {
    this.initListener();
  }

  public initListener(): void {
    if (this._loaded) return;

    const collectionRef = collection(this.firestore, this.pathName);
    const q = query(collectionRef);

    this._unsubscribe = onSnapshot(q, (querySnapshot) => {
      this._usuarios = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Usuario, 'id'>),
      }));
      this._usuariosSubject.next(this._usuarios);
      this._loaded = true;
    });
  }

  async create(user: Usuario) {
    const ref = collection(this.firestore, this.pathName);
    const docRef = await addDoc(ref, user);
    return docRef.id;
  }

  async update(userId: string, data: Partial<Usuario>): Promise<void> {
    const { id, ...payload } = data as any;
    const userRef = doc(this.firestore, `${this.pathName}/${userId}`);
    return updateDoc(userRef, payload);
  }

  getByUId(idu: string): Usuario | null {
    return (
      this._usuarios.find((u) => u.uid === idu && !u.eliminado) ||
      this._usuarios.find((u) => u.uid === idu) ||
      null
    );
  }

  getUsuariosPorRol(idRoles: string[], idArea?: string): Observable<Usuario[]> {
    return this.usuarios$.pipe(
      map((usuarios: Usuario[]) => {
        return usuarios.filter(u => {
          const rolOk = idRoles.includes(u.idRol);
          const areaOk = idArea ? u.idArea === idArea : true;
          return !u.eliminado && rolOk && areaOk;
        });
      })
    );
  }

  obtenerAnalistasPorArea(idArea: string | number): Usuario[] {
    if (idArea === null || idArea === undefined || idArea === '') {
      return [];
    }

    return this._usuarios.filter(
      (u) =>
        !u.eliminado &&
        String(u.idRol) === '4' &&
        String(u.idArea) === String(idArea)
    );
  }

  private buscarAnalistaActivoPorId(
    idUsuario: string,
    idArea: string | number
  ): Usuario | null {
    return (
      this._usuarios.find(
        (u) =>
          String(u.id) === String(idUsuario) &&
          !u.eliminado &&
          String(u.idRol) === '4' &&
          String(u.idArea) === String(idArea)
      ) || null
    );
  }

  obtenerResponsableSucursal(
    idSucursal: string | number,
    idArea: string | number
  ): Usuario | null {
    const idResponsable = this.usuarioSucursalService.obtenerIdResponsable(
      'SOPORTE',
      idSucursal,
      idArea
    );
    if (idResponsable) {
      const principal = this.buscarAnalistaActivoPorId(idResponsable, idArea);
      if (principal) return principal;
    }

    const idsSoporte = this.usuarioSucursalService.obtenerIdsUsuarios(
      'SOPORTE',
      idSucursal,
      idArea
    );
    for (const idUsuario of idsSoporte) {
      const analista = this.buscarAnalistaActivoPorId(idUsuario, idArea);
      if (analista) return analista;
    }

    return null;
  }

  obtenerResponsablesSucursal(
    idSucursal: string | number,
    idArea: string | number,
    incluirGuardias: boolean = false
  ): Usuario[] {
    if (
      idSucursal === null ||
      idSucursal === undefined ||
      idSucursal === '' ||
      idArea === null ||
      idArea === undefined ||
      idArea === ''
    ) {
      return [];
    }

    const responsables: Usuario[] = [];
    const agregarSiNoExiste = (usuario: Usuario | null) => {
      if (usuario && !responsables.some((r) => String(r.id) === String(usuario.id))) {
        responsables.push(usuario);
      }
    };

    agregarSiNoExiste(this.obtenerResponsableSucursal(idSucursal, idArea));

    const idsSoporte = this.usuarioSucursalService.obtenerIdsUsuarios(
      'SOPORTE',
      idSucursal,
      idArea
    );
    for (const idUsuario of idsSoporte) {
      agregarSiNoExiste(this.buscarAnalistaActivoPorId(idUsuario, idArea));
    }

    if (incluirGuardias) {
      const guardias = this._usuarios.filter(
        (u) =>
          !u.eliminado &&
          String(u.idRol) === '4' &&
          String(u.idArea) === String(idArea) &&
          u.esGuardia === true
      );
      for (const guardia of guardias) {
        agregarSiNoExiste(guardia);
      }
    }

    return responsables;
  }

  async registerAuthFirebaseUser(email: string, password: string): Promise<string | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return userCredential.user?.uid || null;
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      throw error;
    }
  }

  async updateUserGuardStatus(userId: string, esGuardia: boolean): Promise<void> {
    const userRef = doc(this.firestore, `${this.pathName}/${userId}`);
    return updateDoc(userRef, { esGuardia });
  }

  async updateUserBlockedStatus(userId: string, bloqueado: boolean): Promise<void> {
    const userRef = doc(this.firestore, `${this.pathName}/${userId}`);
    return updateDoc(userRef, { bloqueado });
  }

  async updateUserDeletedStatus(userId: string, eliminado: boolean = true): Promise<void> {
    const userRef = doc(this.firestore, `${this.pathName}/${userId}`);
    return updateDoc(userRef, { eliminado });
  }

  async updateUserPinAttempts(userId: string, intentos: number, bloqueado?: boolean): Promise<void> {
    const userRef = doc(this.firestore, `${this.pathName}/${userId}`);
    const data: Partial<Usuario> = { intentos };
    if (typeof bloqueado === 'boolean') {
      data.bloqueado = bloqueado;
    }
    return updateDoc(userRef, data);
  }

  async updateUserFcmTokens(userId: string, fcmToken: string[]): Promise<void> {
    const userRef = doc(this.firestore, `${this.pathName}/${userId}`);
    return updateDoc(userRef, { fcmToken });
  }

  async getUsuarioById(id: string): Promise<Usuario | null> {
    return this._usuarios.find(u => u.id === id) || null;
  }

  unsubscribe(): void {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }
}
