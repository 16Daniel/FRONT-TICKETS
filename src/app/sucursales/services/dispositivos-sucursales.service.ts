import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  docData,
  Firestore,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { DispositivosSucursal } from '../interfaces/dispositivos-sucursal.interface';

@Injectable({
  providedIn: 'root'
})
export class DispositivosSucursalesService {
  private readonly pathName: string = 'dispositivos-sucursal';

  constructor(private firestore: Firestore) {}

  getBySucursalId(idSucursal: number | string): Observable<DispositivosSucursal[]> {
    return new Observable<DispositivosSucursal[]>((observer) => {
      const collectionRef = collection(this.firestore, this.pathName);
      const strVal = String(idSucursal);
      const numVal = Number(idSucursal);

      const qStr = query(collectionRef, where('idSucursal', '==', strVal));

      const unsubscribe = onSnapshot(
        qStr,
        async (querySnapshot) => {
          let docs = querySnapshot.docs;
          if (docs.length === 0 && !isNaN(numVal)) {
            const qNum = query(collectionRef, where('idSucursal', '==', numVal));
            const numSnap = await getDocs(qNum);
            docs = numSnap.docs;
          }

          const dispositivos: DispositivosSucursal[] = docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<DispositivosSucursal, 'id'>)
          }));
          observer.next(dispositivos);
        },
        (error) => {
          console.error('Error al suscribirse a dispositivos-sucursal:', error);
          observer.error(error);
        }
      );

      return { unsubscribe };
    });
  }

  async getOnceBySucursalId(idSucursal: number | string): Promise<DispositivosSucursal | null> {
    const collectionRef = collection(this.firestore, this.pathName);
    const strVal = String(idSucursal);
    const numVal = Number(idSucursal);

    let q = query(collectionRef, where('idSucursal', '==', strVal));
    let querySnapshot = await getDocs(q);

    if (querySnapshot.empty && !isNaN(numVal)) {
      q = query(collectionRef, where('idSucursal', '==', numVal));
      querySnapshot = await getDocs(q);
    }

    if (querySnapshot.empty) {
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    return {
      id: docSnap.id,
      ...(docSnap.data() as Omit<DispositivosSucursal, 'id'>)
    };
  }

  async saveOrUpdate(dispositivosSucursal: DispositivosSucursal): Promise<void> {
    if (dispositivosSucursal.id) {
      const documentRef = doc(this.firestore, `${this.pathName}/${dispositivosSucursal.id}`);
      const dataToSave = { ...dispositivosSucursal };
      delete dataToSave.id;
      return updateDoc(documentRef, dataToSave as any);
    } else {
      const collectionRef = collection(this.firestore, this.pathName);
      const newDocRef = doc(collectionRef);
      dispositivosSucursal.id = newDocRef.id;
      const dataToSave = { ...dispositivosSucursal };
      delete dataToSave.id;
      return setDoc(newDocRef, dataToSave);
    }
  }
}
