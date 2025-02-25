import { Component, Input } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';
import { Ticket } from '../../../models/ticket.model';
import { TicketsService } from '../../../services/tickets.service';
import { Usuario } from '../../../models/usuario.model';
import { Sucursal } from '../../../models/sucursal.model';
import { Area } from '../../../models/area';
import { Timestamp } from '@firebase/firestore';

@Component({
  selector: 'app-admin-tickets-list',
  standalone: true,
  imports: [
    DropdownModule,
    CommonModule,
    FormsModule,
    TableModule,
    BadgeModule,
    AccordionModule,
  ],
  templateUrl: './admin-tickets-list.component.html',
  styleUrl: './admin-tickets-list.component.scss',
})
export class AdminTicketsListComponent {
  @Input() tickets: Ticket[] = [];
  sucursales: Sucursal[] = [];
  areas: Area[] = [];

  ticket: Ticket | undefined;
  usuariosHelp: Usuario[] = [];
  ticketSeleccionado: Ticket | undefined;

  constructor(private ticketsService: TicketsService) {}

  actualizaTicket(tk: Ticket) {
    this.ticketsService
      .update(tk)
      .then(() => {})
      .catch((error) => console.error(error));
  }

  showticketA(item: any) {
    this.ticket = item;
    // this.modalticket = true;
  }

  obtenerNombreResponsable(id: string): string {
    let name = '';

    let temp = this.usuariosHelp.filter((x) => x.uid == id);
    if (temp.length > 0) {
      name = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return name;
  }

  obtenerNombreSucursal(idSucursal: string): string {
    let str = '';
    let temp = this.sucursales.filter((x) => x.id == idSucursal);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

  getDate(tsmp: Timestamp): Date {
    // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
    const firestoreTimestamp = tsmp; // Ejemplo
    const date = firestoreTimestamp.toDate(); // Convierte a Date
    return date;
  }

  obtenerBackGroundPrioridad(value: string): string {
    let str = '';

    if (value == 'ALTA') {
      str = '#ff0000';
    }

    if (value == 'MEDIA') {
      str = '#ffe800';
    }

    if (value == 'BAJA') {
      str = '#61ff00';
    }
    return str;
  }
}
