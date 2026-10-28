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
import { AreaOrganigramaService } from '../../areas/services/area-organigrama.service';
import { OrganigramaNodo } from '../../areas/interfaces/organigrama-nodo.interface';

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
    private http: HttpClient,
    private areaOrganigramaService: AreaOrganigramaService
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
    const usuariosAdicionales = await this.obtenerUsuariosDelOrganigrama(alerta);
    const alertaConUsuarios = {
      ...alerta,
      usuarios: Array.from(new Set([...alerta.usuarios.map(String), ...usuariosAdicionales]))
    };
    const alertasRef = collection(this.firestore, this.nombbre_coleccion);
    const docRef = await addDoc(alertasRef, alertaConUsuarios);
    await this.enviarNotificacionPush(alertaConUsuarios);
    return docRef.id;
  }

  private async obtenerUsuariosDelOrganigrama(
    alerta: Omit<HistorialAlerta, 'id'>
  ): Promise<string[]> {
    if (String(alerta.idAlerta) === '9') {
      return this.obtenerUsuariosLideresComites(alerta.ticketId);
    }

    const niveles = ['1', '7'].includes(String(alerta.idAlerta))
      ? [2]
      : String(alerta.idAlerta) === '8'
        ? [1, 2]
        : [];
    if (!niveles.length) {
      return [];
    }

    const ticketSnapshot = await getDoc(doc(this.firestore, 'tickets', alerta.ticketId));
    const ticket = ticketSnapshot.data() as { idArea?: unknown } | undefined;
    if (!ticketSnapshot.exists() || ticket?.idArea === undefined || ticket.idArea === null) {
      return [];
    }

    const organigrama = await this.areaOrganigramaService.obtenerPorArea(String(ticket.idArea));
    const personaIds = niveles
      .map(nivel => this.buscarNodoPorNivel(organigrama?.raiz, nivel)?.personaId)
      .filter((personaId): personaId is string => typeof personaId === 'string' && Boolean(personaId.trim()))
      .map(personaId => personaId.trim());
    const usuarios = await Promise.all(personaIds.map(personaId =>
      this.obtenerUsuarioDelResponsable(personaId)
    ));
    return Array.from(new Set(usuarios.filter((idUsuario): idUsuario is string => Boolean(idUsuario))));
  }

  private async obtenerUsuariosLideresComites(ticketId: string): Promise<string[]> {
    const ticketSnapshot = await getDoc(doc(this.firestore, 'tickets', ticketId));
    const ticket = ticketSnapshot.data() as { comites?: unknown } | undefined;
    if (!ticketSnapshot.exists() || !Array.isArray(ticket?.comites)) {
      return [];
    }

    const idsComites = Array.from(new Set(
      ticket.comites.filter((idComite): idComite is string =>
        typeof idComite === 'string' && Boolean(idComite.trim())
      ).map(idComite => idComite.trim())
    ));
    const comitesSnapshots = await Promise.all(idsComites.map(idComite =>
      getDoc(doc(this.firestore, 'cat_comites', idComite))
    ));
    return this.obtenerUsuariosLideresDeComites(comitesSnapshots);
  }

  private async obtenerUsuariosLideresDeComites(
    comitesSnapshots: Array<{ exists: () => boolean; data: () => unknown }>
  ): Promise<string[]> {
    const idsResponsablesLideres = comitesSnapshots.flatMap(snapshot => {
      const comite = snapshot.data() as { idResponsableLider?: unknown } | undefined;
      return snapshot.exists() &&
        typeof comite?.idResponsableLider === 'string' &&
        comite.idResponsableLider.trim()
        ? [comite.idResponsableLider.trim()]
        : [];
    });
    const idsUsuarios = await Promise.all(idsResponsablesLideres.map(idResponsable =>
      this.obtenerUsuarioDelResponsable(idResponsable)
    ));
    return Array.from(new Set(idsUsuarios.filter((idUsuario): idUsuario is string => Boolean(idUsuario))));
  }

  private async obtenerUsuarioDelResponsable(personaId: string): Promise<string | null> {
    const responsableSnapshot = await getDoc(doc(this.firestore, 'responsables', personaId));
    const datosResponsable = responsableSnapshot.data() as { idUsuario?: unknown } | undefined;
    const idUsuario = datosResponsable?.idUsuario;
    if (!responsableSnapshot.exists() || typeof idUsuario !== 'string' || !idUsuario.trim()) {
      return null;
    }

    const usuarioId = idUsuario.trim();
    const usuarioSnapshot = await getDoc(doc(this.firestore, 'usuarios', usuarioId));
    return usuarioSnapshot.exists() ? usuarioId : null;
  }

  private buscarNodoPorNivel(
    nodo: OrganigramaNodo | undefined,
    nivel: number
  ): OrganigramaNodo | undefined {
    if (!nodo) {
      return undefined;
    }
    if (Number(nodo.id) === nivel) {
      return nodo;
    }
    for (const hijo of nodo.children ?? []) {
      const encontrado = this.buscarNodoPorNivel(hijo, nivel);
      if (encontrado) {
        return encontrado;
      }
    }
    return undefined;
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
