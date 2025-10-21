import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
  doc,
  writeBatch,
  getDocs,
  serverTimestamp
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MensajePendiente } from '../models/mensajes-pendientes.model';

@Injectable({
  providedIn: 'root'
})
export class MensajesPendientesService {
  private collectionRef = collection(this.firestore, 'mensajes-pendientes');

  constructor(private firestore: Firestore) { }

  public async crearMensajesPendientes(
    tipoOrigen: 'Tickets' | 'Mantenimientos' | 'Compras' | 'Pagos',
    idOrigen: string,
    comentario: { idUsuario: string; nombre: string; comentario: string },
    participantes: { idUsuario: string }[]
  ) {

    const usuariosUnicosMap = new Map<string, { idUsuario: string }>();
    participantes.forEach(p => {
      usuariosUnicosMap.set(p.idUsuario, p);
    });
    const usuariosUnicos = Array.from(usuariosUnicosMap.values());

    const batch = writeBatch(this.firestore);

    usuariosUnicos
      .filter(p => p.idUsuario !== comentario.idUsuario) // excluir remitente
      .forEach(p => {
        const docRef = doc(collection(this.firestore, 'mensajes-pendientes'));
        const nuevo: MensajePendiente = {
          idOrigen,
          tipoOrigen,
          idComentario: crypto.randomUUID(),
          idUsuarioDestino: p.idUsuario,
          idUsuarioRemitente: comentario.idUsuario,
          // nombreRemitente: comentario.nombre,
          // mensaje: comentario.comentario,
          timestamp: new Date(),
          leido: false,
        };
        batch.set(docRef, nuevo);
      });

    await batch.commit();
  }

  obtenerPendientesPorUsuario(idUsuario: string): Observable<MensajePendiente[]> {
    const q = query(
      this.collectionRef,
      where('idUsuarioDestino', '==', idUsuario),
      where('leido', '==', false)
    );
    return collectionData(q, { idField: 'id' }) as Observable<MensajePendiente[]>;
  }

  async marcarComoLeidos(
    idOrigen: string,
    tipoOrigen: 'Tickets' | 'Mantenimientos' | 'Compras' | 'Pagos',
    idUsuario: string
  ) {
    const q = query(
      this.collectionRef,
      where('idOrigen', '==', idOrigen),
      where('tipoOrigen', '==', tipoOrigen),
      where('idUsuarioDestino', '==', idUsuario),
      where('leido', '==', false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(this.firestore);

    snapshot.forEach(docSnap => {
      batch.update(docSnap.ref, { leido: true });
    });

    await batch.commit();
  }
}
