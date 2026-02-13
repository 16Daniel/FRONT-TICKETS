import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, query, where } from '@angular/fire/firestore';
import { ColorUsuario } from '../interfaces/color-usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class CalendarColorsService {

  pathName: string = 'colores-usuarios';

  constructor(private firestore: Firestore) { }

  getByArea(idArea: string): Observable<ColorUsuario[]> {
    const ref = collection(this.firestore, this.pathName);
    const q = query(ref, where('idArea', '==', idArea));
    return collectionData(q, { idField: 'id' }) as Observable<ColorUsuario[]>;
  }

  create(color: ColorUsuario): Promise<any> {
    const ref = collection(this.firestore, this.pathName);
    return addDoc(ref, color);
  }

  delete(id: string): Promise<void> {
    const ref = doc(this.firestore, `${this.pathName}/${id}`);
    return deleteDoc(ref);
  }
}
