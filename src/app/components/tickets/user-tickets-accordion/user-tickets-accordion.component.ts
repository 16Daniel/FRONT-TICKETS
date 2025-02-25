import { Component, Input } from '@angular/core';
import { Ticket } from '../../../models/ticket.model';
import { AdminTicketsListComponent } from '../admin-tickets-list/admin-tickets-list.component';
import { Sucursal } from '../../../models/sucursal.model';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-user-tickets-accordion',
  standalone: true,
  imports: [
    AdminTicketsListComponent,
    BadgeModule,
    CommonModule,
    FormsModule,
    AccordionModule,
  ],
  templateUrl: './user-tickets-accordion.component.html',
  styleUrl: './user-tickets-accordion.component.scss',
})
export class UserTicketsAccordionComponent {
  @Input() tickets: Ticket[] = [];
  @Input() sucursales: Sucursal[] = [];
  @Input() usuarioAgrupacion: Usuario = new Usuario();

  filtrarTicketsPorSucursal(idSucursal: number | any) {
    return this.tickets.filter((x) => x.idSucursal == idSucursal);
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

  obtenerBackGroundSucursal(value: number): string {
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

  ordenarSucursalesUser(sucursales: Sucursal[]): Sucursal[] {
    return sucursales.sort((a, b) => {
      const ticketsA = this.filtrarTicketsPorSucursal(a.id).length;
      const ticketsB = this.filtrarTicketsPorSucursal(b.id).length;
      return ticketsB - ticketsA; // Ordena de mayor a menor
    });
  }
}
