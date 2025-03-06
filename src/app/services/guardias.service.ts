import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { addDoc, collection, Firestore, getDocs, onSnapshot, query, where } from '@angular/fire/firestore';
import { Guardia } from '../models/guardia';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuardiasService {

    constructor(private firestore: Firestore, private http: HttpClient) {
        
      }

         async create(guardia:Guardia) {
            const ref = collection(this.firestore, 'guardias');
            const docRef = await addDoc(ref, guardia);
            return docRef.id;
          }

             get(userId: string): Observable<any[]> {
                  return new Observable((observer) => {
                    // Referencia a la colección
                    const collectionRef = collection(this.firestore, 'guardias');
              
                    // Consulta filtrada por el ID del usuario
                    const q = query(
                      collectionRef,
                      where('idUsuario', '==', userId)
                    );
              
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
    
   async obtenerGuardiaUsuario(fecha:Date ,idUsuario:string) {
        const coleccionRef = collection(this.firestore,'guardias');
      
        // Convertir las fechas a timestamps de Firestore
        fecha.setHours(0,0,0,0);
        const consulta = query(
          coleccionRef,
          where('fecha', '==', fecha),
          where('idUsuario','==',idUsuario)
        );
      
        const querySnapshot = await getDocs(consulta);
        const documentos:Guardia[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guardia));
        
        return documentos;
      }


        async obtenerGuardiasFechas(fechaInicial:Date , fechaFinal:Date) {
              const coleccionRef = collection(this.firestore,'guardias');
            
              // Convertir las fechas a timestamps de Firestore
              fechaInicial.setHours(0,0,0,0);
              fechaFinal.setHours(0,0,0,0); 
      
              const consulta = query(
                coleccionRef,
                where('fecha', '>=', fechaInicial),
                where('fecha', '<=', fechaFinal
                )
              );
            
              const querySnapshot = await getDocs(consulta);
              const documentos:Guardia[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guardia));
              
              return documentos;
            }


}
