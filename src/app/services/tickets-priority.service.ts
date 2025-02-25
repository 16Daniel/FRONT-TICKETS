import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  collection,
  collectionData,
  doc,
  Firestore,
  setDoc,
} from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { PrioridadTicket } from '../models/prioridad-ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketsPriorityService {
  pathName: string = 'cat_prioridad_tickets';

  constructor(private firestore: Firestore, private http: HttpClient) {
    // this.inicializarCatalogo();
  }

  get(): Observable<PrioridadTicket[] | any[]> {
    const sucursalesCollection = collection(this.firestore, this.pathName);
    return collectionData(sucursalesCollection, { idField: 'id' });
  }

  private inicializarCatalogo() {
    this.loadJson().subscribe((response) => {
      console.log('JSON cargado:', response);
      this.postMasivo(response);
    });
  }

  // Método para hacer un POST masivo conservando los IDs
  async postMasivo(data: any[]): Promise<void> {
    try {
      const sucursalesCollection = collection(this.firestore, this.pathName);

      // Recorre el array de datos y guarda cada objeto en Firestore
      for (const item of data) {
        // Usa setDoc para especificar el ID del documento
        await setDoc(doc(sucursalesCollection, item.id.toString()), item);
        console.log(`Documento guardado con ID ${item.id}:`, item);
      }

      console.log('Todos los documentos han sido guardados correctamente.');
    } catch (error) {
      console.error('Error al guardar los documentos:', error);
      throw error; // Propaga el error para manejarlo en el componente
    }
  }

  private loadJson(): Observable<any> {
    return this.http.get('/assets/catalogs/prioridades-ticket.json'); // Ruta al archivo JSON
  }
}
