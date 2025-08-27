import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { addDoc, collection, collectionData, CollectionReference, deleteDoc, doc, docData, Firestore, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { Proveedor } from '../models/AdministracionCompra';


@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  public proveedoresTab:string = 'cat_compras_proveedor';
 constructor(private afs: Firestore) {}

  // Obtener referencia a la colección
  private getProveedoresCollection() {
    return collection(this.afs, 'cat_compras_proveedor');
  }

  // Obtener referencia a un documento específico
  private getProveedorDoc(id: string) {
    return doc(this.afs, `cat_compras_proveedor/${id}`);
  }

  // Obtener todos los proveedores
  getProveedores(): Observable<Proveedor[]> {
    const proveedoresCollection = this.getProveedoresCollection();
    return collectionData(proveedoresCollection, { idField: 'id' }) as Observable<Proveedor[]>;
  }
  

    getProveedoresUsuario(idUsuario: string): Observable<any> {
    const provCollection = collection(this.afs,this.proveedoresTab);
    
    // Crear la consulta con el filtro por idUsuario
    const comprasQuery = query(
      provCollection, 
      where('idUsuario', '==', idUsuario),
    );
    
    return collectionData(comprasQuery, { idField: 'id' });
  }


  // Obtener un proveedor por ID
  getProveedor(id: string): Observable<Proveedor> {
    const proveedorDoc = this.getProveedorDoc(id);
    return docData(proveedorDoc, { idField: 'id' }) as Observable<Proveedor>;
  }

  // Crear un nuevo proveedor
  async createProveedor(proveedor: Proveedor): Promise<void> {
    const { id, ...proveedorSinId } = proveedor;
    const proveedoresCollection = this.getProveedoresCollection();
    await addDoc(proveedoresCollection, proveedorSinId);
  }

  // Actualizar un proveedor existente
  async updateProveedor(id: string, proveedor: Proveedor): Promise<void> {
    const { id: _, ...proveedorSinId } = proveedor;
    const proveedorDoc = this.getProveedorDoc(id);
    await updateDoc(proveedorDoc, proveedorSinId);
  }

  // Eliminar un proveedor
  async deleteProveedor(id: string): Promise<void> {
    const proveedorDoc = this.getProveedorDoc(id);
    await deleteDoc(proveedorDoc);
  }
}