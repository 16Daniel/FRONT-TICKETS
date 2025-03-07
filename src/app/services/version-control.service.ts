import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  Firestore,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  getDocsFromServer,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ControlVersion } from '../models/control-version.model';

@Injectable({
  providedIn: 'root',
})
export class VersionControlService {
  pathName: string = 'control_versiones';

  constructor(private firestore: Firestore) {}

  async versionExist(version: string): Promise<boolean> {
    const ref = collection(this.firestore, this.pathName);
    const q = query(ref, where('version', '==', version));
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty; // Devuelve true si la versión ya existe
  }

  async create(controlVersion: ControlVersion) {
    const existe = await this.versionExist(controlVersion.version);
    if (existe) {
      throw new Error('La versión ya existe');
    }

    const ref = collection(this.firestore, this.pathName);
    const docRef = await addDoc(ref, controlVersion);
    return docRef.id;
  }

  get(): Observable<ControlVersion[] | any> {
    const versionsCollection = collection(this.firestore, this.pathName);
    return collectionData(versionsCollection, { idField: 'id' });
  }

  getLastVersion(): Observable<ControlVersion | any> {
    const ref = collection(this.firestore, this.pathName);

    // Query: ordenar por fecha descendente y limitar a 1
    const q = query(ref, orderBy('fecha', 'desc'), limit(1));

    // Convertir la consulta a un Observable
    return collectionData(q, { idField: 'id' }) as Observable<ControlVersion[]>;
  }
}
