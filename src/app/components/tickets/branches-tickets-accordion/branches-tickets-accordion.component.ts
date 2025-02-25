import { Component, Input } from '@angular/core';
import { Sucursal } from '../../../models/sucursal.model';
import { Ticket } from '../../../models/ticket.model';
import { TicketsService } from '../../../services/tickets.service';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../../models/usuario.model';
import { Area } from '../../../models/area';
import { Timestamp } from '@firebase/firestore';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';
@Component({
  selector: 'app-branches-tickets-accordion',
  standalone: true,
  imports: [
    DropdownModule,
    CommonModule,
    FormsModule,
    TableModule,
    BadgeModule,
    AccordionModule,
  ],
  templateUrl: './branches-tickets-accordion.component.html',
  styleUrl: './branches-tickets-accordion.component.scss',
})
export class BranchesTicketsAccordionComponent {
  @Input() tickets: Ticket[] = [];
  sucursales: Sucursal[] = [];
  areas: Area[] = [];
  ticket: Ticket | undefined;
  usuariosHelp: Usuario[] = [];
  ticketSeleccionado: Ticket | undefined;

  constructor(private ticketsService: TicketsService) {}

  ordenarSucursales(): Sucursal[] {
    return this.sucursales.sort((a, b) => {
      const ticketsA = this.filtrarTicketsPorSucursal(a.id).length;
      const ticketsB = this.filtrarTicketsPorSucursal(b.id).length;
      return ticketsB - ticketsA; // Ordena de mayor a menor
    });
  }

  filtrarTicketsPorSucursal(idSucursal: number | any) {
    return this.tickets.filter((x) => x.idSucursal == idSucursal);
  }

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

  obtenerResponsablesUC(idSucursal: string): string {
    let idr = '';
    for (let item of this.usuariosHelp) {
      const existeSucursal = item.sucursales.some(
        (sucursal) => sucursal.id == idSucursal
      );
      if (existeSucursal) {
        idr = item.nombre + ' ' + item.apellidoP;
      }
    }

    return idr;
  }

  obtenerColorTexto(value: number): string {
    let str = '';

    if (value >= 5) {
      str = '#fff';
    }

    if (value > 0 && value <= 4) {
      str = '#000';
    }

    if (value == 0) {
      str = '#fff';
    }

    return str;
  }

  obtenerBackGroundAcordion(value: number): string {
    let str = '';

    if (value >= 5) {
      str = '#ff0000';
    }

    if (value > 0 && value <= 4) {
      str = '#ffe800';
    }

    if (value == 0) {
      str = '#00a312';
    }

    return str;
  }
}
