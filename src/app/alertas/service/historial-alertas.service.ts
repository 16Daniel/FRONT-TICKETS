import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where
} from '@angular/fire/firestore';
import { firstValueFrom, Observable } from 'rxjs';
import { FieldPath, Timestamp } from 'firebase/firestore';
import { environment } from '../../../environments/environments';

export interface HistorialAlerta {
  id: string;
  ticketId: string;
  fecha: Date | string | Timestamp;
  idAlerta: string;
  usuarios: string[];
  comites?: string[];
  lecturas?: Record<string, boolean>;
}

export interface CategoriaAlerta {
  id: string;
  categoria: string;
  nombre: string;
}

interface PushNotificationRequest {
  Titulo: string;
  Mensaje: string;
  tokens: string[];
  usuarios: string[];
}

@Injectable({
  providedIn: 'root'
})
export class HistorialAlertasService {
  nombbre_coleccion = 'historial_alertas'

  constructor(
    private firestore: Firestore,
    private http: HttpClient
  ) {}

  obtenerAlertasPorUsuario(idUsuario: string): Observable<HistorialAlerta[]> {
    const alertasRef = collection(this.firestore, this.nombbre_coleccion);
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
    const alertasRef = collection(this.firestore, this.nombbre_coleccion);
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
    const alertasRef = collection(this.firestore, this.nombbre_coleccion);
    const docRef = await addDoc(alertasRef, alerta);
    await this.enviarNotificacionPush(alerta);
    return docRef.id;
  }

  private async enviarNotificacionPush(alerta: Omit<HistorialAlerta, 'id'>): Promise<void> {
    const usuarios = Array.from(new Set(alerta.usuarios.map(String)));
    const [ticketSnapshot, categoriasSnapshot, usuariosSnapshots] = await Promise.all([
      getDoc(doc(this.firestore, 'tickets', alerta.ticketId)),
      getDocs(collection(this.firestore, 'cat_alertas')),
      Promise.all(
        usuarios.map(idUsuario =>
          getDoc(doc(this.firestore, 'usuarios', idUsuario))
        )
      )
    ]);

    const ticket = ticketSnapshot.data() as { idSucursal?: unknown } | undefined;
    if (!ticketSnapshot.exists() || ticket?.idSucursal === undefined || ticket.idSucursal === null) {
      throw new Error(`No se pudo obtener la sucursal del ticket ${alerta.ticketId} para enviar la notificación.`);
    }

    const sucursalSnapshot = await getDoc(
      doc(this.firestore, 'cat_sucursales', String(ticket.idSucursal))
    );
    const sucursal = sucursalSnapshot.data() as { nombre?: unknown } | undefined;
    if (!sucursalSnapshot.exists() || typeof sucursal?.nombre !== 'string' || !sucursal.nombre.trim()) {
      throw new Error(`No se encontró el nombre de la sucursal ${String(ticket.idSucursal)} para enviar la notificación.`);
    }

    const categoriaSnapshot = categoriasSnapshot.docs.find(categoriaDoc => {
      const categoria = categoriaDoc.data() as Partial<CategoriaAlerta>;
      return String(categoria.id) === String(alerta.idAlerta) ||
        categoriaDoc.id === String(alerta.idAlerta);
    });
    const categoriaAlerta = categoriaSnapshot?.data() as Partial<CategoriaAlerta> | undefined;
    const titulo = categoriaAlerta?.nombre || categoriaAlerta?.categoria;
    if (!titulo) {
      throw new Error(`No se encontró el nombre de la categoría de alerta ${alerta.idAlerta}.`);
    }

    const tokens = Array.from(new Set(
      usuariosSnapshots.flatMap(usuarioSnapshot => {
        const usuario = usuarioSnapshot.data() as { fcmToken?: unknown } | undefined;
        return usuarioSnapshot.exists() && Array.isArray(usuario?.fcmToken)
          ? usuario.fcmToken.filter((token): token is string =>
              typeof token === 'string' && token.trim().length > 0
            )
          : [];
      })
    ));
    const request: PushNotificationRequest = {
      Titulo: titulo,
      Mensaje: `Tienes un nuevo ticket en alerta. Sucursal: ${sucursal.nombre}.`,
      tokens,
      usuarios
    };
    const url = `${environment.ticketsApiConfig.url.replace(/\/+$/, '')}/Notificaciones/enviar-push`;
    const headers = new HttpHeaders({
      'x-api-key': environment.ticketsApiConfig.apiKey
    });

    await firstValueFrom(this.http.post<void>(url, request, { headers }));
  }

  marcarComoLeida(idDocumento: string, idUsuario: string): Promise<void> {
    const alertaRef = doc(this.firestore, this.nombbre_coleccion, idDocumento);
    return updateDoc(alertaRef, new FieldPath('lecturas', idUsuario), true);
  }
}
