import { Injectable } from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { AreaOrganigrama } from '../interfaces/area-organigrama.model';

@Injectable({
  providedIn: 'root',
})
export class AreaOrganigramaService {
  private readonly collectionName = 'areas_organigrama';

  constructor(private firestore: Firestore) {}

  async obtenerPorArea(idArea: string): Promise<AreaOrganigrama | null> {
    const documentRef = doc(this.firestore, `${this.collectionName}/${idArea}`);
    const snapshot = await getDoc(documentRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as AreaOrganigrama;
  }
}
