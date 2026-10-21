import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  setDoc,
  updateDoc
} from '@angular/fire/firestore';
import { Rol } from '../interfaces/rol.model';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  pathName: string = 'cat_roles';

  constructor(private firestore: Firestore, private http: HttpClient) { }

  get(): Observable<Rol[]> {
    const rolesCollection = collection(this.firestore, this.pathName);
    return collectionData(rolesCollection, { idField: 'id' }) as Observable<Rol[]>;
  }

  async create(rol: Partial<Rol>): Promise<void> {
    const coll = collection(this.firestore, this.pathName);
    const snap = await getDocs(coll);
    let maxId = 0;
    snap.docs.forEach((d) => {
      const num = parseInt(d.id, 10);
      if (!isNaN(num) && num > maxId) maxId = num;
    });
    const nextId = (maxId + 1).toString();
    const docRef = doc(this.firestore, `${this.pathName}/${nextId}`);
    await setDoc(docRef, {
      id: nextId,
      nombre: (rol.nombre || '').trim().toUpperCase(),
    });
  }

  async update(rol: Partial<Rol>, idRol: string | number): Promise<void> {
    const docRef = doc(this.firestore, `${this.pathName}/${idRol}`);
    await updateDoc(docRef, {
      nombre: (rol.nombre || '').trim().toUpperCase(),
    });
  }

  async delete(idRol: string | number): Promise<void> {
    const docRef = doc(this.firestore, `${this.pathName}/${idRol}`);
    await deleteDoc(docRef);
  }

  private inicializarCatalogo() {
    this.loadJson().subscribe((response) => {
      console.log('JSON cargado:', response);
      this.postMasivo(response);
    });
  }

  async postMasivo(data: any[]): Promise<void> {
    try {
      const sucursalesCollection = collection(this.firestore, this.pathName);
      for (const item of data) {
        await setDoc(doc(sucursalesCollection, item.id.toString()), item);
      }
      console.log('Todos los documentos han sido guardados correctamente.');
    } catch (error) {
      console.error('Error al guardar los documentos:', error);
      throw error;
    }
  }

  private loadJson(): Observable<any> {
    return this.http.get('/assets/catalogs/roles.json');
  }
}
