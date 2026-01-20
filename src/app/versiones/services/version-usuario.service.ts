import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, Firestore, getDocs, limit, orderBy, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { VersionUsuario } from '../interfaces/version-usuario.model';

@Injectable({
  providedIn: 'root'
})
export class VersionUsuarioService {
  pathName: string = 'version_usuario';

  constructor(private firestore: Firestore) { }

  async updateUserVersion(versionUsuario: VersionUsuario): Promise<void> {
    const versionesRef = collection(this.firestore, this.pathName);

    // Buscar si ya existe un documento con idUsuario y idVersion
    const q = query(
      versionesRef,
      where('idUsuario', '==', versionUsuario.idUsuario),
      where('idVersion', '==', versionUsuario.idVersion)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Si no existe, lo insertamos
      await addDoc(versionesRef, versionUsuario);
      console.log('Documento insertado:', versionUsuario);
    } else {
      // Si ya existe, no hacemos nada
      console.log('El documento ya existe, no se insertó.');
    }
  }

  getLastVersionByUser(idUsuario: string): Observable<VersionUsuario | any> {
    const versionesRef = collection(this.firestore, this.pathName);

    // Query: Filtrar por idUsuario, ordenar por fecha descendente, limitar a 1
    const q = query(
      versionesRef,
      where('idUsuario', '==', idUsuario),
      orderBy('fecha', 'desc'),
      limit(1)
    );

    // Convertir la consulta a un Observable
    return collectionData(q, { idField: 'id' }) as Observable<VersionUsuario[]>;
  }
}
