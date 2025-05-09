import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  Firestore,
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

  getUsersHelp(idArea?: string): Observable<any[]> {
    return new Observable((observer) => {
      // Referencia a la colección
      const collectionRef = collection(this.firestore, this.pathName);
  
      // Arreglo de condiciones de filtrado
      const filtros: any[] = [where('idRol', '==', '4')];
  
      // Agrega filtro dinámico por idArea si está definido
      if (idArea) {
        filtros.push(where('idArea', '==', idArea));
      }
  
      // Construcción de la query con los filtros
      const q = query(collectionRef, ...filtros);
  
      // Escucha en tiempo real
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
  
  // getUsersHelp(): Observable<any[]> {
  //   return new Observable((observer) => {
  //     // Referencia a la colección
  //     const collectionRef = collection(this.firestore, this.pathName);

  //     // Consulta filtrada por el ID del usuario
  //     const q = query(collectionRef, 
  //       where('idRol', '==', '4'),
  //     );



  //     // Escucha en tiempo real
  //     const unsubscribe = onSnapshot(
  //       q,
  //       (querySnapshot) => {
  //         const tickets = querySnapshot.docs.map((doc) => ({
  //           id: doc.id,
  //           ...doc.data(),
  //         }));

  //         // Emitir los tickets actualizados
  //         observer.next(tickets);
  //       },
  //       (error) => {
  //         console.error('Error en la suscripción:', error);
  //         observer.error(error);
  //       }
  //     );

  //     // Manejo de limpieza
  //     return { unsubscribe };
  //   });
  // }

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
}
