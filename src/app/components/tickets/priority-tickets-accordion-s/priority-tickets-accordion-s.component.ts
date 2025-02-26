import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { Sucursal } from '../../../models/sucursal.model';
import { Ticket } from '../../../models/ticket.model';
import { BadgeModule } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';
import { RequesterTicketsListComponent } from '../requester-tickets-list/requester-tickets-list.component';
import { CommonModule } from '@angular/common';
import { BranchMaintenanceTableComponent } from '../../maintenance/branch-maintenance-table/branch-maintenance-table.component';
// import { AccordionBranchMaintenance10x10Component } from '../../maintenance/accordion-branch-maintenance10x10/accordion-branch-maintenance10x10.component';

@Component({
  selector: 'app-priority-tickets-accordion-s',
  standalone: true,
  imports: [
    CommonModule,
    BadgeModule,
    AccordionModule,
    RequesterTicketsListComponent,
    BranchMaintenanceTableComponent,
    // AccordionBranchMaintenance10x10Component,
  ],
  templateUrl: './priority-tickets-accordion-s.component.html',
})
export class PriorityTicketsAccordionSComponent {
  @Input() arr_ultimosmantenimientos: Mantenimiento10x10[] = [];
  @Input() tickets: Ticket[] = [];
  @Input() sucursales: Sucursal[] = [];
  // @Input() ordenarxmantenimiento: boolean = false;
  @Output() clickEvent = new EventEmitter<Ticket>();
  itemtk: Ticket | undefined;
  showModalTicketDetail: boolean = false;

  obtenerColorDeFondoSucursal(value: number): string {
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

  obtenerTicketsPorSucursal(idSucursal: number | any) {
    return this.tickets.filter((x) => x.idSucursal == idSucursal);
  }

  ordenarSucursalesUser(catsucursales: Sucursal[]): Sucursal[] {
    return catsucursales.sort((a, b) => {
      const ticketsA = this.obtenerTicketsPorSucursal(a.id).length;
      const ticketsB = this.obtenerTicketsPorSucursal(b.id).length;
      return ticketsB - ticketsA; // Ordena de mayor a menor
    });
  }

  obtenerColorDeTexto(value: number): string {
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

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.clickEvent.emit(ticket);
  }
}
