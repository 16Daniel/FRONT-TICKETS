import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  constructor(private firestore: Firestore) {}


   get(collectionName:string): Observable<any[]> {
      const vcollection = collection(this.firestore, collectionName);
      return collectionData(vcollection, { idField: 'id' }); // Incluye el ID del documento
    }

  async create(collectionName:string,item:any) {
        const ref = collection(this.firestore, collectionName);
        const docRef = await addDoc(ref, item);
        return docRef.id;
      }

  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${collectionName}/${docId}`);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error al eliminar el documento:', error);
    }
  }

  async updateDoc(collectionname: string, data: any): Promise<void> {
    let collectionName = collectionname;
    let docId = data.id;
    const documentRef = doc(this.firestore, `${collectionName}/${docId}`);
    return updateDoc(documentRef, data);  
  }


}
