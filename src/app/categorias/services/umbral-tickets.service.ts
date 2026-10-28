import { Injectable } from '@angular/core';
import { collection, Firestore, getDocs, query, where, Timestamp } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Ticket } from '../../tickets/interfaces/ticket.model';

export interface UmbralFiltros {
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
  idSucursales?: string[];
  idUsuarios?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UmbralTicketsService {

  constructor(private firestore: Firestore) {}

  getTicketsPorFiltros(idArea: string, filtros: UmbralFiltros): Observable<Ticket[]> {
    const ticketsCollection = collection(this.firestore, 'tickets');
    const constraints: any[] = [
      where('idArea', '==', idArea)
    ];

    if (filtros.fechaInicio) {
      const startOfDay = new Date(filtros.fechaInicio);
      startOfDay.setHours(0, 0, 0, 0);
      constraints.push(where('fecha', '>=', Timestamp.fromDate(startOfDay)));
    }

    if (filtros.fechaFin) {
      const endOfDay = new Date(filtros.fechaFin);
      endOfDay.setHours(23, 59, 59, 999);
      constraints.push(where('fecha', '<=', Timestamp.fromDate(endOfDay)));
    }

    const q = query(ticketsCollection, ...constraints);

    return from(getDocs(q)).pipe(
      map(snapshot => {
        let tickets = snapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() } as Ticket;
        });

        // Filtrado en memoria por sucursales
        if (filtros.idSucursales && filtros.idSucursales.length > 0) {
          tickets = tickets.filter(t => filtros.idSucursales!.includes(t.idSucursal));
        }

        // Filtrado en memoria por usuarios
        if (filtros.idUsuarios && filtros.idUsuarios.length > 0) {
          tickets = tickets.filter(t => filtros.idUsuarios!.includes(t.idUsuario));
        }

        return tickets;
      })
    );
  }
}
