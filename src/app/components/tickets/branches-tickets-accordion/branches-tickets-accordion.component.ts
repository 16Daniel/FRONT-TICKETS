import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';

import { Usuario } from '../../../models/usuario.model';
import { Sucursal } from '../../../models/sucursal.model';
import { Ticket } from '../../../models/ticket.model';
import { Area } from '../../../models/area';
import { AdminTicketsListComponent } from '../admin-tickets-list/admin-tickets-list.component';
import { RequesterTicketsListComponent } from "../requester-tickets-list/requester-tickets-list.component";

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
    AdminTicketsListComponent
],
  templateUrl: './branches-tickets-accordion.component.html',
  styleUrl: './branches-tickets-accordion.component.scss',
})

export class BranchesTicketsAccordionComponent {
  @Input() tickets: Ticket[] = [];
  @Input() sucursales: Sucursal[] = [];
  areas: Area[] = [];
  ticket: Ticket | undefined;
  usuariosHelp: Usuario[] = [];
  ticketSeleccionado: Ticket | undefined;

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
