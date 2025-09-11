import { Injectable } from '@angular/core';
import { firstValueFrom, map, Observable } from 'rxjs';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  Firestore,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Usuario } from '../models/usuario.model';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  pathName: string = 'usuarios';

  constructor(private firestore: Firestore, private auth: Auth) { }

  async create(user: Usuario) {
    const ref = collection(this.firestore, this.pathName);
    const docRef = await addDoc(ref, user);
    return docRef.id; // Devolver el ID del documento creado
  }

  get(): Observable<any[]> {
    const usersCollection = collection(this.firestore, this.pathName);
    return collectionData(usersCollection, { idField: 'id' });
  }

  async getByUId(idu: string) {
    const usersCollection = collection(this.firestore, 'usuarios');
    const userQuery = query(usersCollection, where('uid', '==', idu));

    let user = await collectionData(userQuery, { idField: 'id' });
    return user;
  }

  getUsersHelp(
    idArea?: string,
    incluirEspecialistas: boolean = false,
    incluirAdministradores: boolean = false
  ): Observable<any[]> {
    return new Observable((observer) => {
      const collectionRef = collection(this.firestore, this.pathName);

      const filtros: any[] = [];

      let roles: string[] = [];

      if (incluirEspecialistas) {
        roles.push('4', '7');
      } else {
        roles.push('4');
      }

      if (incluirAdministradores) {
        roles.push('5');
      }

      if (roles.length > 1) {
        filtros.push(where('idRol', 'in', roles));
      } else {
        filtros.push(where('idRol', '==', roles[0]));
      }

      if (idArea) {
        filtros.push(where('idArea', '==', idArea));
      }

      const q = query(collectionRef, ...filtros);

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const users = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          observer.next(users);
        },
        (error) => {
          console.error('Error en la suscripción:', error);
          observer.error(error);
        }
      );

      return { unsubscribe };
    });
  }

  async registerAuthFirebaseUser(email: string, password: string): Promise<string | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return userCredential.user?.uid || null; // Devuelve el UID del usuario
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      throw error;
    }
  }

  async updateUserGuardStatus(userId: string, esGuardia: boolean): Promise<void> {
    const userRef = doc(this.firestore, `${this.pathName}/${userId}`);
    return updateDoc(userRef, { esGuardia });
  }

  getUsuariosEspecialistas(idSucursal: string, idArea?: string): Observable<any[]> {
    const usersCollection = collection(this.firestore, this.pathName);

    // Construimos los filtros dinámicamente
    const filtros: any[] = [where('idRol', '==', '7')];

    if (idArea) {
      filtros.push(where('idArea', '==', idArea));
    }

    const q = query(usersCollection, ...filtros);

    return collectionData(q, { idField: 'id' }).pipe(
      map((usuarios: any[]) => {
        return usuarios.filter(usuario => {
          return usuario.sucursales?.some((sucursal: any) => sucursal.id === idSucursal);
        });
      })
    );
  }

  async getUsuarioSucursal(idSucursal: string): Promise<Usuario | null> {
    const usersCollection = collection(this.firestore, 'usuarios');
    const userQuery = query(usersCollection, where('idRol', '==', '2'));

    // Obtener todos los usuarios con rol 2
    const usuarios = await firstValueFrom(collectionData(userQuery, { idField: 'id' })) as Usuario[];

    // Buscar el primero que tenga esa sucursal
    const usuarioEncontrado = usuarios.find(usuario =>
      usuario.sucursales?.some(s => s.id === idSucursal)
    );

    return usuarioEncontrado || null;
  }

    async getUsuarioById(id: string): Promise<Usuario | null> {
    try {
    const usersCollection = collection(this.firestore, 'usuarios');
    const userQuery = query(usersCollection, where('id', '==', id));
    
    const querySnapshot = await getDocs(userQuery);
    
    if (querySnapshot.empty) {
      return null; // o throw new Error('Usuario no encontrado');
    }
    // Retorna el primer documento encontrado
    const userDoc = querySnapshot.docs[0];
    return {
      id: userDoc.id,
      ...userDoc.data()
    } as Usuario;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
  }

}
