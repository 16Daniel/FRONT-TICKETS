import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  Firestore,
  query,
  updateDoc,
  where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { FieldPath, Timestamp } from 'firebase/firestore';

export interface HistorialAlerta {
  id: string;
  ticketId: string;
  fecha: Date | string | Timestamp;
  idAlerta: string;
  usuarios: string[];
  lecturas?: Record<string, boolean>;
}

export interface CategoriaAlerta {
  id: string;
  categoria: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistorialAlertasService {
  constructor(private firestore: Firestore) {}

  obtenerAlertasPorUsuario(idUsuario: string): Observable<HistorialAlerta[]> {
    const alertasRef = collection(this.firestore, 'historial_alertas');
    const alertasQuery = query(
      alertasRef,
      where('usuarios', 'array-contains', idUsuario)
    );
    return collectionData(alertasQuery, { idField: 'id' }) as Observable<HistorialAlerta[]>;
  }

  obtenerCategorias(): Observable<CategoriaAlerta[]> {
    const categoriasRef = collection(this.firestore, 'cat_alertas');
    return collectionData(categoriasRef) as Observable<CategoriaAlerta[]>;
  }

  marcarComoLeida(idDocumento: string, idUsuario: string): Promise<void> {
    const alertaRef = doc(this.firestore, 'historial_alertas', idDocumento);
    return updateDoc(alertaRef, new FieldPath('lecturas', idUsuario), true);
  }
}
