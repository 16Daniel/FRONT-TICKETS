import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  Firestore,
  getDocs,
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
  comites?: string[];
  lecturas?: Record<string, boolean>;
}

export const ALERTA_TICKET_WHATSAPP_ID = 'ticket_whatsapp';

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

  async obtenerAlertasPorTicketYTipo(
    ticketId: string,
    idAlerta: string
  ): Promise<HistorialAlerta[]> {
    const alertasRef = collection(this.firestore, 'historial_alertas');
    const alertasQuery = query(
      alertasRef,
      where('ticketId', '==', ticketId)
    );
    const snapshot = await getDocs(alertasQuery);
    return snapshot.docs.map(documento => ({
      id: documento.id,
      ...documento.data()
    } as HistorialAlerta)).filter(alerta => String(alerta.idAlerta) === idAlerta);
  }

  async registrarAlerta(alerta: Omit<HistorialAlerta, 'id'>): Promise<string> {
    const alertasRef = collection(this.firestore, 'historial_alertas');
    const docRef = await addDoc(alertasRef, alerta);
    return docRef.id;
  }

  marcarComoLeida(idDocumento: string, idUsuario: string): Promise<void> {
    const alertaRef = doc(this.firestore, 'historial_alertas', idDocumento);
    return updateDoc(alertaRef, new FieldPath('lecturas', idUsuario), true);
  }
}
