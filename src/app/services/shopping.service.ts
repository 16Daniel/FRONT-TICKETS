import { Injectable } from '@angular/core';
import { addDoc, arrayUnion, collection, collectionData, doc, Firestore, orderBy, query, QueryConstraint, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { from, map, Observable, switchMap } from 'rxjs';
import { AdministracionCompra, Proveedor } from '../models/AdministracionCompra';
import { 
  Storage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject, 
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class ShoppingService {
  comprastab:string = 'compras_administracion'; 
  constructor(private firestore: Firestore,private storage: Storage) { }
    
   getCatTipo(): Observable<any> {
      const sucursalesCollection = collection(this.firestore,'cat_compras_tipo');
      return collectionData(sucursalesCollection, { idField: 'id' }); // Incluye el ID del documento
    }
  
    getProveedores(): Observable<any> {
      const sucursalesCollection = collection(this.firestore,'cat_compras_proveedor');
      return collectionData(sucursalesCollection, { idField: 'id' }); // Incluye el ID del documento
    }
     
    getCompras(): Observable<any> {
       const comprasCollection = collection(this.firestore, this.comprastab);
  
  // Crear la consulta con el filtro por idUsuario
  const comprasQuery = query(
    comprasCollection, 
    where('statuspago', '==', '1'),
  );
  
  return collectionData(comprasQuery, { idField: 'id' });
 }
  
   
getComprasAdminstradorArea(idArea:string): Observable<any> {
       const comprasCollection = collection(this.firestore, this.comprastab);
  
  // Crear la consulta con el filtro por idUsuario
  const comprasQuery = query(
    comprasCollection, 
    where('statuspago', '==', '1'),
    where('idArea', '==',idArea)

  );
  
  return collectionData(comprasQuery, { idField: 'id' });
  }

   getComprasUsuario(idUsuario: string): Observable<any> {
  const comprasCollection = collection(this.firestore, this.comprastab);
  
  // Crear la consulta con el filtro por idUsuario
  const comprasQuery = query(
    comprasCollection, 
    where('idUsuario', '==', idUsuario),
    where('statuspago', '==', '1')
  );
  
  return collectionData(comprasQuery, { idField: 'id' });
}
   async AgregarCompra(item:AdministracionCompra) : Promise<void>
    {
       const ref = collection(this.firestore,this.comprastab);
       const docRef = await addDoc(ref, item);
    }

  
getComprasFiltro(
  fechaini: Date | undefined, 
  fechaFin: Date | undefined, 
  statuscompra: string, 
  statuspago: string,
  idSucursal: string,
  idUsuario:string,
  idTipo:string,
  region:string,
  idArea:string 
): Observable<AdministracionCompra[]> {
  
  const comprasCollection = collection(this.firestore, this.comprastab);
  let condiciones: QueryConstraint[] = [];

  // Agregar filtros
  if (statuspago && statuspago.trim() !== '-1') {
    condiciones.push(where('statuspago', '==', statuspago));
  }

  if (statuscompra && statuscompra.trim() !== '-1') {
    condiciones.push(where('statuscompra', '==', statuscompra));
  }
  
  if (idSucursal && idSucursal.trim() !== '') {
    condiciones.push(where('idsucursal', '==', idSucursal));
  }
  
   if (idUsuario && idUsuario.trim() !== '') {
    condiciones.push(where('idUsuario', '==', idUsuario));
  }

  if (idTipo && idTipo.trim() !== '-1') {
    condiciones.push(where('tipoCompra', '==', idTipo));
  }

   if (region && region.trim() !== '-1') {
    condiciones.push(where('region', '==', region));
  }

   if (idArea && idArea.trim() !== '-1') {
    condiciones.push(where('idArea', '==', idArea));
  }



  if (fechaini && fechaFin) {
    fechaini.setHours(0,0,0,0);
    fechaFin.setHours(23,59,59,999);
    const inicioTimestamp = Timestamp.fromDate(fechaini);
    const finTimestamp = Timestamp.fromDate(fechaFin);
    
    condiciones.push(where('fecha', '>=', inicioTimestamp));
    condiciones.push(where('fecha', '<=', finTimestamp));
  }

  // Ordenar por fecha (opcional, pero recomendado)
  condiciones.push(orderBy('fecha', 'desc'));

  const comprasQuery = query(comprasCollection, ...condiciones);
  
  return collectionData(comprasQuery, { idField: 'id' }) as Observable<AdministracionCompra[]>;
}

async uploadFile(file: File, name: string,fecha:Date, path: string): Promise<string> {
  let año:string = fecha.getFullYear().toString(); 
  let mes:string = (fecha.getMonth()+1)<10 ? '0'+(fecha.getMonth()+1):''+(fecha.getMonth()+1);

  let strfecha:string = año +'-'+ mes +'/'; 
  const fileRef = ref(this.storage, path+ strfecha + name.trim() + '.' + file.name.split('.')[1]);
  
  try {
    const snapshot = await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    throw new Error(`Error al subir el archivo: ${error}`);
  }
}


  // Eliminar archivo
  deleteFile(fileUrl: string): Observable<void> {
    const fileRef = ref(this.storage, fileUrl);
    return from(deleteObject(fileRef));
  }

 async updateCompra(data:any): Promise<void> {
    let docId = data.id;
    const documentRef = doc(this.firestore, `${this.comprastab}/${docId}`);
    return updateDoc(documentRef, data);
  }
    
updateLastCommentRead(
    ticketId: string,
    idUsuario: string,
    ultimoComentarioLeido: number
  ) {
    const ticketRef = doc(this.firestore, `${this.comprastab}/${ticketId}`);

    // Actualizar el índice del último comentario leído para un participante
    return updateDoc(ticketRef, {
      participantesChat: arrayUnion({
        idUsuario,
        ultimoComentarioLeido,
      }),
    });
  }


  obtenerComprasFacturaPendiente(idUsuario:string): Observable<AdministracionCompra[]> {
    const comprasCollection = collection(this.firestore, this.comprastab);
    
    // Obtener la fecha límite (7 días atrás desde hoy)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 7);
    
    const comprasQuery = query(
      comprasCollection,
      where('idUsuario', '==', idUsuario),
      where('metodoPago', '==', '2'),
      where('factura', '==', ''),
      where('fechadepago', '!=', null),
      where('fechadepago', '<=', Timestamp.fromDate(fechaLimite))
    );

    return collectionData(comprasQuery, { idField: 'id' }).pipe(
      map(compras => compras as AdministracionCompra[])
    );
  }


} 
