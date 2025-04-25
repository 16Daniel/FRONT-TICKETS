import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Sucursal } from '../models/sucursal.model';

@Injectable({
  providedIn: 'root',
})
export class BranchesService {
  pathName: string = 'cat_sucursales';

  constructor(private firestore: Firestore, private http: HttpClient) {
    // this.inicializarCatalogo();
  }

  // async create(sucursal: Sucursal) {
  //   const ref = doc(this.firestore, `${this.pathName}/${sucursal.id}`); // 👈 tú defines el id
  //   await setDoc(ref, sucursal);
  //   return sucursal.id; // Ya sabes cuál es el ID
  // }

  async create(sucursal: Sucursal): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${sucursal.id}`);

    const snapshot = await getDoc(documentRef);

    if (snapshot.exists()) {
      throw new Error(`La sucursal con id ${sucursal.id} ya existe.`);
    }

    await setDoc(documentRef, sucursal);
  }

  get(): Observable<Sucursal[] | any[]> {
    const sucursalesCollection = collection(this.firestore, this.pathName);
    const q = query(sucursalesCollection, orderBy('id'));
    return collectionData(q, { idField: 'id' });
  }

  async update(sucursal: Sucursal | any, idSucursal: string): Promise<void> {
    const documentRef = doc(this.firestore, `${this.pathName}/${idSucursal}`);
    return updateDoc(documentRef, sucursal);
  }

  async delete(idSucursal: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${this.pathName}/${idSucursal}`);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error al eliminar el documento:', error);
    }
  }

  private inicializarCatalogo() {
    this.loadJson().subscribe((response) => {
      console.log('JSON cargado:', response);
      this.postMasivo(response);
    });
  }

  // Método para hacer un POST masivo conservando los IDs
  async postMasivo(data: any[]): Promise<void> {
    try {
      const sucursalesCollection = collection(this.firestore, this.pathName);

      // Recorre el array de datos y guarda cada objeto en Firestore
      for (const item of data) {
        // Usa setDoc para especificar el ID del documento
        await setDoc(doc(sucursalesCollection, item.id.toString()), item);
        console.log(`Documento guardado con ID ${item.id}:`, item);
      }

      console.log('Todos los documentos han sido guardados correctamente.');
    } catch (error) {
      console.error('Error al guardar los documentos:', error);
      throw error; // Propaga el error para manejarlo en el componente
    }
  }

  private loadJson(): Observable<any> {
    return this.http.get('/assets/catalogs/sucursales.json'); // Ruta al archivo JSON
  }
}
