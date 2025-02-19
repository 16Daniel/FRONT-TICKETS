import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Ticket } from '../../../models/ticket.model';
import { RequesterTicketsListComponent } from '../requester-tickets-list/requester-tickets-list.component';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-priority-tickets-accordion',
  standalone: true,
  imports: [
    RequesterTicketsListComponent,
    AccordionModule,
    BadgeModule,
    CommonModule,
  ],
  templateUrl: './priority-tickets-accordion.component.html',
  styleUrl: './priority-tickets-accordion.component.scss',
})
export class PriorityTicketsAccordionComponent implements OnInit {
  @Input() tickets: Ticket[] = [];
  @Output() clickEvent = new EventEmitter<Ticket>();

  ngOnInit(): void {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  activeIndex: number | null = null;
  userdata: any;

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.clickEvent.emit(ticket);
  }

  obtenerContadorTickets(prioridad: any): number {
    if (prioridad === 'PÁNICO')
      return this.tickets.filter((x) => x.prioridadSucursal === 'PÁNICO').length;
    else if (prioridad === 'ALTA')
      return this.tickets.filter((x) => x.prioridadSucursal === 'ALTA').length;
    else if (prioridad === 'MEDIA')
      return this.tickets.filter((x) => x.prioridadSucursal === 'MEDIA').length;
    else return this.tickets.filter((x) => x.prioridadSucursal === 'BAJA').length;
  }

  obtenerBackgroundColorPrioridad(value: string): string {
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

    if (value == 'PÁNICO') {
      str = 'black';
    }
    return str;
  }

  obtenerTicketsFiltrados(prioridad: any): Ticket[] {
    if (prioridad === 'PÁNICO')
      return this.tickets.filter((x) => x.prioridadSucursal === 'PÁNICO');
    else if (prioridad === 'ALTA')
      return this.tickets.filter((x) => x.prioridadSucursal === 'ALTA');
    else if (prioridad === 'MEDIA')
      return this.tickets.filter((x) => x.prioridadSucursal === 'MEDIA');
    else return this.tickets.filter((x) => x.prioridadSucursal === 'BAJA');
  }

  toggleAccordion(index: number) {
    this.activeIndex = this.activeIndex === index ? null : index;
  }
}
