import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  Firestore,
  getDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CatalogosService {
  constructor(private firestore: Firestore) {}

  getRoles(): Observable<any[]> {
    const usersCollection = collection(this.firestore, 'cat_roles');
    return collectionData(usersCollection, { idField: 'id' });
  }

  getSucursalesDepto(): Observable<any[]> {
    const sucursalesCollection = collection(
      this.firestore,
      'cat_departamentos'
    );
    return collectionData(sucursalesCollection, { idField: 'id' }); // Incluye el ID del documento
  }

  getProveedores(): Observable<any[]> {
    const vcollection = collection(this.firestore, 'cat_proveedores');
    return collectionData(vcollection, { idField: 'id' }); // Incluye el ID del documento
  }

  getCategoriasprov(idprov: string): Observable<any[]> {
    const vcollection = collection(
      this.firestore,
      'cat_proveedores/' + idprov + '/cat_categorias'
    );
    return collectionData(vcollection, { idField: 'id' }); // Incluye el ID del documento
  }

  getCategorias(): Observable<any[]> {
    const vcollection = collection(this.firestore, 'cat_categorias');
    return collectionData(vcollection, { idField: 'id' }); // Incluye el ID del documento
  }

  getCatStatus(): Observable<any[]> {
    const sucursalesCollection = collection(this.firestore, 'cat_status');
    return collectionData(sucursalesCollection, { idField: 'id' }); // Incluye el ID del documento
  }

  async getCategoria(idprov: string, docId: string): Promise<any> {
    const documentRef = doc(
      this.firestore,
      `/cat_proveedores/${idprov}/cat_categorias/${docId}`
    ); // Referencia al documento
    const documentSnapshot = await getDoc(documentRef); // Consulta única
    if (documentSnapshot.exists()) {
      return documentSnapshot.data(); // Retorna los datos del documento
    } else {
      throw new Error('Documento no encontrado');
    }
  }
}
