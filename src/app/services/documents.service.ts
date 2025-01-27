import { Injectable } from '@angular/core';
import { deleteDoc, doc, Firestore, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  constructor(private firestore: Firestore) {}

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
