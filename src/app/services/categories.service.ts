import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  Firestore,
  getDoc,
  setDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria.mdoel';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  pathName: string = 'cat_categorias';

  constructor(private firestore: Firestore, private http: HttpClient) {
    // this.inicializarCatalogo();
  }

  get(): Observable<Categoria[] | any[]> {
    const vcollection = collection(this.firestore, this.pathName);
    return collectionData(vcollection, { idField: 'id' });
  }

  getCategoriasprov(idprov: string): Observable<any[]> {
    const vcollection = collection(
      this.firestore,
      'cat_areas/' + idprov + '/cat_categorias'
    );
    return collectionData(vcollection, { idField: 'id' }); // Incluye el ID del documento
  }

  async getCategoria(idprov: string, docId: string): Promise<any> {
    const documentRef = doc(
      this.firestore,
      `/cat_areas/${idprov}/cat_categorias/${docId}`
    ); // Referencia al documento
    const documentSnapshot = await getDoc(documentRef); // Consulta única
    if (documentSnapshot.exists()) {
      return documentSnapshot.data(); // Retorna los datos del documento
    } else {
      throw new Error('Documento no encontrado');
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
    return this.http.get('/assets/catalogs/categorias.json'); // Ruta al archivo JSON
  }
}
