import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  addDoc,
  collection,
  collectionData,
  Firestore,
  onSnapshot,
  query,
  where,
} from '@angular/fire/firestore';
import { Usuario } from '../models/usuario.model';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  getUsersHelp(): Observable<any[]> {
    return new Observable((observer) => {
      // Referencia a la colección
      const collectionRef = collection(this.firestore, 'usuarios');

      // Consulta filtrada por el ID del usuario
      const q = query(collectionRef, where('isRol', '==', '4'));

      // Escucha en tiempo real
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const tickets = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Emitir los tickets actualizados
          observer.next(tickets);
        },
        (error) => {
          console.error('Error en la suscripción:', error);
          observer.error(error);
        }
      );

      // Manejo de limpieza
      return { unsubscribe };
    });
  }

  async addUser(user: Usuario) {
    const ref = collection(this.firestore, 'usuarios');
    const docRef = await addDoc(ref, user);
    return docRef.id; // Devolver el ID del documento creado
  }

  async getuserdata(idu: string) {
    const usersCollection = collection(this.firestore, 'usuarios');
    const userQuery = query(usersCollection, where('uid', '==', idu));

    let user = await collectionData(userQuery, { idField: 'id' });
    return user;
  }

  getusers(): Observable<any[]> {
    const usersCollection = collection(this.firestore, 'usuarios');
    return collectionData(usersCollection, { idField: 'id' });
  }

  async registerUser(email: string, password: string): Promise<string | null> {
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
}
