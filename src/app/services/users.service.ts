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

@Injectable({
  providedIn: 'root',
})
export class UsersService {
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
    return this._usuarios.find(u => u.uid === idu) || null;
  }

  getUsuariosPorRol(idRoles: string[], idArea?: string): Observable<Usuario[]> {
    return this.usuarios$.pipe(
      map((usuarios: Usuario[]) => {
        return usuarios.filter(u => {
          const rolOk = idRoles.includes(u.idRol);
          const areaOk = idArea ? u.idArea === idArea : true;
          return rolOk && areaOk;
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

  async getUsuarioSucursal(idSucursal: string): Promise<Usuario | null> {
    const usuarioEncontrado = this._usuarios.find(usuario =>
      usuario.idRol === '2' &&
      usuario.sucursales?.some(s => s.id === idSucursal)
    );
    return usuarioEncontrado || null;
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
