import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { catchError, Observable, throwError, timeout } from "rxjs";
import { environment } from '../../environments/enviroments';
import { Sucursal } from '../Interfaces/Sucursal';
import { Rol } from '../Interfaces/Rol';
import { Ruta } from '../Interfaces/Ruta';
import { Usuario } from '../Interfaces/Usuario';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, getDoc, getDocs, onSnapshot, query, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { Ticket, TicketDB } from '../Interfaces/ticket';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@firebase/auth';
import { Auth } from '@angular/fire/auth';
import { Notificacion } from '../Interfaces/Notificacion';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private url: string = environment.apiURL;
  private headers = new HttpHeaders();

  constructor(private http: HttpClient, private firestore:Firestore,private auth:Auth) 
  {
    this.headers.append("Accept", "application/json");
    this.headers.append("content-type", "application/json");
   }

   getRoles():Observable<any[]>
   {
    const usersCollection = collection(this.firestore, 'cat_roles');
    return collectionData(usersCollection, { idField: 'id' });
   }

 async registerUser(email: string, password: string): Promise<string | null> {
  try {
    const userCredential = await createUserWithEmailAndPassword(this.auth,email, password);
    return userCredential.user?.uid || null; // Devuelve el UID del usuario
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    throw error;
  }
}

async deleteDocument(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(this.firestore, `${collectionName}/${docId}`);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar el documento:', error);
  }
}

 async addUser(user:Usuario)
   {
    const ref = collection(this.firestore, 'usuarios');
    const docRef = await addDoc(ref, user);
    return docRef.id; // Devolver el ID del documento creado
   }

 // Inicio de sesión
 async login(email: string, password: string): Promise<any> {
   return signInWithEmailAndPassword(this.auth, email, password);
 }

 async getuserdata(idu:string)
 {
  const usersCollection = collection(this.firestore, 'usuarios');
  const userQuery = query(usersCollection, where('uid', '==', idu));

  let user = await collectionData(userQuery, { idField: 'id' }); 
  return user; 
 }

 getusers():Observable<any[]> 
 {
  const usersCollection = collection(this.firestore, 'usuarios');
  return collectionData(usersCollection, { idField: 'id' });
 }

 async updateDoc(collectionname:string,data:any): Promise<void> {
  let collectionName = collectionname; 
  let docId = data.id; 
  const documentRef = doc(this.firestore, `${collectionName}/${docId}`);
  return updateDoc(documentRef, data);
}   

 // Cerrar sesión
 async logout(): Promise<void> {
   return signOut(this.auth);
 }

 getSucursalesDepto(): Observable<any[]> {
   const sucursalesCollection = collection(this.firestore, 'cat_departamentos');
   return collectionData(sucursalesCollection, { idField: 'id' }); // Incluye el ID del documento
 }

 getProveedores(): Observable<any[]> {
   const vcollection = collection(this.firestore, 'cat_proveedores');
   return collectionData(vcollection, { idField: 'id' }); // Incluye el ID del documento
 }

 getCategorias(): Observable<any[]> {
  const vcollection = collection(this.firestore, 'cat_categorias');
  return collectionData(vcollection, { idField: 'id' }); // Incluye el ID del documento
}

 getCategoriasprov(idprov:string): Observable<any[]> {
   const vcollection = collection(this.firestore, 'cat_proveedores/'+idprov+'/cat_categorias');
   return collectionData(vcollection, { idField: 'id' }); // Incluye el ID del documento
 }

 getCatStatus(): Observable<any[]> {
  const sucursalesCollection = collection(this.firestore, 'cat_status');
  return collectionData(sucursalesCollection, { idField: 'id' }); // Incluye el ID del documento
}

getTk(idtk:string): Observable<any[]> {
  const sucursalesCollection = collection(this.firestore, 'tickets/'+idtk);
  return collectionData(sucursalesCollection, { idField: 'id' }); // Incluye el ID del documento
}

 async addticket(ticket:Ticket)
   {
    const ref = collection(this.firestore, 'tickets');
    const docRef = await addDoc(ref, ticket);
    return docRef.id; // Devolver el ID del documento creado
   }

   getTickets(iduser:string): Observable<any[]> {
      const vcollection = collection(this.firestore, 'tickets');
      return collectionData(vcollection, { idField: 'id' }); // Incluye el ID del documento
    }

    getRealTimeTicketsByUserId(userId: string): Observable<any[]> {
      return new Observable((observer) => {
        // Referencia a la colección
        const collectionRef = collection(this.firestore, 'tickets');
  
        // Consulta filtrada por el ID del usuario
        const q = query(collectionRef, where('iduser', '==', userId),
        where('status','in', ['1','2','4','5','6']),
      );
  
        // Escucha en tiempo real
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const tickets = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          // Emitir los tickets actualizados
          observer.next(tickets);
        }, (error) => {
          console.error('Error en la suscripción:', error);
          observer.error(error);
        });
  
        // Manejo de limpieza
        return { unsubscribe };
      });
    }
     

    getTicketsResponsable(userId: string): Observable<any[]> {
      return new Observable((observer) => {
        // Referencia a la colección
        const collectionRef = collection(this.firestore, 'tickets');
  
        // Consulta filtrada por el ID del usuario
        const q = query(collectionRef, where('responsable', '==', userId),
        where('status','in', ['1','2','4','5','6']),
      );
  
        // Escucha en tiempo real
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const tickets = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          // Emitir los tickets actualizados
          observer.next(tickets);
        }, (error) => {
          console.error('Error en la suscripción:', error);
          observer.error(error);
        });
  
        // Manejo de limpieza
        return { unsubscribe };
      });
    }


    getHistorialtickets(fechaini:Date,fechafin:Date,uid:string,rol:string): Observable<any[]> {
   
      let formdata = new FormData();
      formdata.append("fechaini",fechaini.toISOString());
      formdata.append("fechafin",fechafin.toISOString());
      formdata.append("idu",uid);
      formdata.append("rol",rol);
      return this.http.post<any[]>(this.url+`Tickets/getTicktesH`,formdata,{headers:this.headers})
    }

    async updateTicket(data:any): Promise<void> {
      let collectionName = 'tickets'; 
      let docId = data.id; 
      const documentRef = doc(this.firestore, `${collectionName}/${docId}`);
      return updateDoc(documentRef, data);
    }   

    async getCategoria(idprov: string, docId: string): Promise<any> {
      const documentRef = doc(this.firestore, `/cat_proveedores/${idprov}/cat_categorias/${docId}`); // Referencia al documento
      const documentSnapshot = await getDoc(documentRef); // Consulta única
      if (documentSnapshot.exists()) {
        return documentSnapshot.data(); // Retorna los datos del documento
      } else {
        throw new Error('Documento no encontrado');
      }
    }


    getNotificaciones(userId: string): Observable<any[]> {
      return new Observable((observer) => {
        // Referencia a la colección
        const collectionRef = collection(this.firestore, 'Notificaciones');

        // Consulta filtrada por el ID del usuario
        const q = query(collectionRef, where('uid', '==', userId),
      );
  
        // Escucha en tiempo real
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const tickets = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          // Emitir los tickets actualizados
          observer.next(tickets);
        }, (error) => {
          console.error('Error en la suscripción:', error);
          observer.error(error);
        });
  
        // Manejo de limpieza
        return { unsubscribe };
      });
    }

    async addNotifiacion(notificacion:Notificacion)
    {
     const ref = collection(this.firestore, 'Notificaciones');
     const docRef = await addDoc(ref, notificacion);
     return docRef.id; // Devolver el ID del documento creado
    }

    getUsersHelp(): Observable<any[]> {
      return new Observable((observer) => {
        // Referencia a la colección
        const collectionRef = collection(this.firestore, 'usuarios');
  
        // Consulta filtrada por el ID del usuario
        const q = query(collectionRef, where('isRol', '==', '4'),
      );
  
        // Escucha en tiempo real
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const tickets = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          // Emitir los tickets actualizados
          observer.next(tickets);
        }, (error) => {
          console.error('Error en la suscripción:', error);
          observer.error(error);
        });
  
        // Manejo de limpieza
        return { unsubscribe };
      });
    }

    
   AddTkSQL(data:any):Observable<any>
   {
      return this.http.post<any>(this.url+'Tickets/addTicket',data,{headers:this.headers})
   }

   getalltk():Observable<any[]> 
 {
  const usersCollection = collection(this.firestore, 'tickets');
  return collectionData(usersCollection, { idField: 'id' });
 }

}

