import { Injectable, inject } from '@angular/core';
import { 
  Firestore, collection, collectionData, doc, 
  addDoc, updateDoc, deleteDoc, docData, 
  query,
  where,
  QueryConstraint
} from '@angular/fire/firestore';
import { 
  Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject 
} from '@angular/fire/storage';
import { Observable, from, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DevolucionAla } from '../interfaces/no-conformidad';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private collectionName = 'devoluciones_ala';

  getDevoluciones(): Observable<DevolucionAla[]> {
  const devCollection = collection(this.firestore, this.collectionName);
  const q = query(devCollection, where('estatus', '!=', 'DONE'));
  return collectionData(q, { idField: 'id' }) as Observable<DevolucionAla[]>;
}

  getDevolucionesSucursal(sucursal:string): Observable<DevolucionAla[]> {
  const devCollection = collection(this.firestore, this.collectionName);
  const q = query(devCollection, where('sucursal', '==', sucursal));
  return collectionData(q, { idField: 'id' }) as Observable<DevolucionAla[]>;
}

filtrarDevoluciones(
  fechaini?: Date,
  fechafin?: Date,
  sucursal?: string,
  estatus?: string
): Observable<DevolucionAla[]> {
  const devCollection = collection(this.firestore, this.collectionName);
  const constraints: QueryConstraint[] = [];

  if (estatus !== undefined && estatus !== null && estatus !== '') {
    constraints.push(where('estatus', '==', estatus));
  }
  if (sucursal !== undefined && sucursal !== null && sucursal !== '') {
    constraints.push(where('sucursal', '==', sucursal));
  }
  if (fechaini !== undefined && fechaini !== null) {
    constraints.push(where('fecha', '>=', fechaini));
  }
  if (fechafin !== undefined && fechafin !== null) {
    constraints.push(where('fecha', '<=', fechafin));
  }

    if (!estatus) {
    constraints.push(where('estatus', '!=', 'DONE'));
  }

  const q = query(devCollection, ...constraints);
  return collectionData(q, { idField: 'id' }) as Observable<DevolucionAla[]>;
}


  getDevolucionById(id: string): Observable<DevolucionAla> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<DevolucionAla>;
  }

  async createDevolucion(data: DevolucionAla, files: File[]): Promise<void> {
    const fotosUrl = await this.uploadImages(files);
    const payload = {
      ...data,
      codigoFormato: 'FSUPR-0501',
      fotosUrl,
      createdAt: new Date()
    };
    await addDoc(collection(this.firestore, this.collectionName), payload);
  }

  async updateDevolucion(id: string, data: Partial<DevolucionAla>, newFiles: File[], currentPhotos: string[]): Promise<void> {
    let uploadedUrls: string[] = [];
    if (newFiles.length > 0) {
      uploadedUrls = await this.uploadImages(newFiles);
    }
    
    const finalFotos = [...currentPhotos, ...uploadedUrls].slice(0, 3);
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);

    await updateDoc(docRef, {
      ...data,
      fotosUrl: finalFotos
    });
  }

  async deleteDevolucion(devolucion: DevolucionAla): Promise<void> {
    if (devolucion.fotosUrl && devolucion.fotosUrl.length > 0) {
      for (const url of devolucion.fotosUrl) {
        try {
          const imageRef = ref(this.storage, url);
          await deleteObject(imageRef);
        } catch (e) {
          console.warn('No se pudo borrar imagen:', e);
        }
      }
    }
    const docRef = doc(this.firestore, `${this.collectionName}/${devolucion.id}`);
    await deleteDoc(docRef);
  }

  private async uploadImages(files: File[]): Promise<any[]> {
    const uploadPromises = files.map(file => {
      const filePath = `devoluciones/${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, filePath);
      return uploadBytesResumable(storageRef, file).then(snapshot => getDownloadURL(snapshot.ref));
    });
    return Promise.all(uploadPromises);
  }
}