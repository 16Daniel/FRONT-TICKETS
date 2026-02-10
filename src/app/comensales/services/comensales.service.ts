import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, query, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { ConteoComensales, sucursalesComensales } from '../interfaces/ConteoComensales';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComensalesService {
 comensalestab: string = 'conteo_comensales';
 sucursalestab: string = 'sucursales_comensales'

  constructor(private firestore: Firestore) {
  }

    obtenerSucursales(): Observable<sucursalesComensales[]> {
    const ref = collection(this.firestore,this.sucursalestab); // Cambia 'sucursales' por tu nombre de colección
    return collectionData(ref, { idField: 'id' }) as Observable<sucursalesComensales[]>;
  }

  async agregarSucursal(sucursal: sucursalesComensales) {
      const ref = collection(this.firestore, this.sucursalestab);
      const docRef = await addDoc(ref, sucursal);
      return docRef.id; // Devolver el ID del documento creado
    }

   async actualizarSucursal(sucursal:sucursalesComensales  | any, id: string): Promise<void> {
      const documentRef = doc(this.firestore, `${this.sucursalestab}/${id}`);
      return updateDoc(documentRef, sucursal);
    }
  
    async borrarSucursal(id: string): Promise<void> {
       try {
      // Referencia al documento específico
      const docRef = doc(this.firestore, this.sucursalestab, id);
      
      // Eliminar el documento
      await deleteDoc(docRef);
      console.log('Documento eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar documento:', error);
    }
    }

      async agregarconteo(item:ConteoComensales) {
      const ref = collection(this.firestore, this.comensalestab);
      const docRef = await addDoc(ref, item);
      return docRef.id; // Devolver el ID del documento creado
    }
 
    obtenerconteos(): Observable<ConteoComensales[]> {
    const ref = collection(this.firestore,this.comensalestab); // Cambia 'sucursales' por tu nombre de colección
    return collectionData(ref, { idField: 'id' }) as Observable<ConteoComensales[]>;
  }

obtenerconteosEntrefechas(
  fechaInicio?: Date, 
  fechaFin?: Date,
  idSucursal?:string
): Observable<ConteoComensales[]> {
  debugger
  let ref = collection(this.firestore, this.comensalestab);
  let q = query(ref);
  
  // Aplicar filtros si se proporcionan fechas
  const condiciones = [];
  
  if (fechaInicio) {
    fechaInicio?.setHours(0,0,0,0);
    condiciones.push(where('fecha', '>=', Timestamp.fromDate(fechaInicio)));
  }
  
  if (fechaFin) {
    // Ajustar fechaFin al final del día
    const finAjustado = new Date(fechaFin);
    finAjustado.setHours(23, 59, 59, 999);
    condiciones.push(where('fecha', '<=', Timestamp.fromDate(finAjustado)));
  }
  
  if(idSucursal)
    {
      condiciones.push(where('idSucursal', '==',idSucursal));
    }

  // Si hay condiciones, crear la consulta con ellas
  if (condiciones.length > 0) {
    q = query(ref, ...condiciones);
  }
  
  return collectionData(q, { idField: 'id' }) as Observable<ConteoComensales[]>;
}

async borrarConteo(id: string): Promise<void> {
       try {
      // Referencia al documento específico
      const docRef = doc(this.firestore, this.comensalestab, id);
      
      // Eliminar el documento
      await deleteDoc(docRef);
      console.log('Documento eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar documento:', error);
    }
    }


    async actualizarConteo(item:ConteoComensales | any, id: string): Promise<void> {
      const documentRef = doc(this.firestore, `${this.comensalestab}/${id}`);
      return updateDoc(documentRef, item);
    }
  
}
