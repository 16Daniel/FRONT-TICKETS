import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  setDoc,
} from '@angular/fire/firestore';
import { Rol } from '../interfaces/rol.model';
import { normalizarRolFirestore, normalizarRutaInicio } from '../constants/catalogo-permisos.constants';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  pathName: string = 'cat_roles';

  constructor(private firestore: Firestore, private http: HttpClient) {}

  /**
   * Obtiene los roles directamente desde Firestore (única fuente de la verdad).
   */
  get(): Observable<Rol[]> {
    const rolesCollection = collection(this.firestore, this.pathName);
    return (collectionData(rolesCollection, { idField: 'id' }) as Observable<Rol[]>).pipe(
      map((roles) =>
        (roles || [])
          .map((rol) => normalizarRolFirestore(rol))
          .sort((a, b) => {
            const numA = parseInt(a.id, 10);
            const numB = parseInt(b.id, 10);
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }
            return (a.nombre || '').localeCompare(b.nombre || '');
          })
      )
    );
  }

  /**
   * Crea un nuevo rol en Firestore con su configuración y permisos de menú
   */
  async create(rol: Partial<Rol>): Promise<string> {
    const coll = collection(this.firestore, this.pathName);
    const snap = await getDocs(coll);
    let maxId = 0;
    snap.docs.forEach((d) => {
      const num = parseInt(d.id, 10);
      if (!isNaN(num) && num > maxId) maxId = num;
    });
    const nextId = (maxId + 1).toString();
    const docRef = doc(this.firestore, `${this.pathName}/${nextId}`);

    const payload = this.construirPayloadRol(rol, nextId);
    await setDoc(docRef, payload);
    return nextId;
  }

  /**
   * Actualiza un rol existente en Firestore guardando su configuración y permisos de menú
   */
  async update(rol: Partial<Rol>, idRol: string | number): Promise<void> {
    const idStr = String(idRol);
    const docRef = doc(this.firestore, `${this.pathName}/${idStr}`);
    const payload = this.construirPayloadRol(rol, idStr);
    await setDoc(docRef, payload, { merge: true });
  }

  /**
   * Elimina un rol de Firestore
   */
  async delete(idRol: string | number): Promise<void> {
    const docRef = doc(this.firestore, `${this.pathName}/${idRol}`);
    await deleteDoc(docRef);
  }

  private construirPayloadRol(rol: Partial<Rol>, id: string): Record<string, any> {
    return {
      id,
      nombre: (rol.nombre || '').trim().toUpperCase(),
      descripcion: (rol.descripcion || '').trim(),
      rutaInicio: normalizarRutaInicio(rol.rutaInicio),
      permisos: Array.isArray(rol.permisos) ? [...new Set(rol.permisos)] : [],
    };
  }

  async postMasivo(data: any[]): Promise<void> {
    try {
      const rolesCollection = collection(this.firestore, this.pathName);
      for (const item of data) {
        const normalizado = normalizarRolFirestore({
          id: item.id.toString(),
          nombre: item.nombre,
          descripcion: item.descripcion,
          rutaInicio: item.rutaInicio,
          permisos: item.permisos,
        });
        await setDoc(
          doc(rolesCollection, item.id.toString()),
          this.construirPayloadRol(normalizado, item.id.toString()),
          { merge: true }
        );
      }
    } catch (error) {
      console.error('Error al guardar los documentos:', error);
      throw error;
    }
  }

  private loadJson(): Observable<any> {
    return this.http.get('/assets/catalogs/roles.json');
  }
}
