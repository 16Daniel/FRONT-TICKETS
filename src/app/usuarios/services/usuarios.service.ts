import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  Firestore,
  onSnapshot,
  query,
  updateDoc,
} from '@angular/fire/firestore';
import { Usuario } from '../models/usuario.model';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

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

  constructor(private firestore: Firestore, private auth: Auth) {
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

  async addUserFcmToken(userId: string, fcmToken: string): Promise<void> {
    const userRef = doc(this.firestore, `${this.pathName}/${userId}`);
    return updateDoc(userRef, { fcmToken: arrayUnion(fcmToken) });
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
