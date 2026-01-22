import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';

import { RequesterTicketsListComponent } from '../requester-tickets-list/requester-tickets-list.component';
import { GraficaTickets30DiasComponent } from '../../../mantenimientos/components/radiografia/grafica-tickets-30-dias/grafica-tickets-30-dias.component';
import { Ticket } from '../../models/ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';

@Component({
  selector: 'app-priority-tickets-accordion-analyst',
  standalone: true,
  imports: [
    CommonModule,
    BadgeModule,
    AccordionModule,
    RequesterTicketsListComponent,
    TooltipModule,
    FormsModule,
    GraficaTickets30DiasComponent
  ],
  templateUrl: './priority-tickets-accordion-analyst.component.html',
  styleUrl: './priority-tickets-accordion-analyst.component.scss',
})
export class PriorityTicketsAccordionAnalystComponent implements OnInit {
  @Input() tickets: Ticket[] = [];
  @Input() sucursales: Sucursal[] = [];
  @Input() esEspectadorActivo: boolean = false;

  @Output() clickEvent = new EventEmitter<Ticket>();

  itemtk: Ticket | undefined;
  showModalTicketDetail: boolean = false;
  usuario: Usuario | any;
  mostrarRadiografiaMap: { [idSucursal: string]: boolean } = {};

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

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

  verificarTicketsNuevos(tickets: Ticket[]) {
    let nuevosTickets = tickets.filter(x => x.idEstatusTicket == '1');
    return nuevosTickets.length > 0;
  }

  verificarChatNoLeido(tickets: Ticket[]): boolean {
    return tickets.some(ticket => {
      const participantes = ticket.participantesChat.sort((a, b) => b.ultimoComentarioLeido - a.ultimoComentarioLeido);
      const participante = participantes.find((p) => p.idUsuario === this.usuario.id);

      if (participante) {
        const ultimoComentarioLeido = participante.ultimoComentarioLeido;
        const comentarios = ticket.comentarios;

        return comentarios.length > ultimoComentarioLeido; // Si hay al menos 1 chat sin leer, devuelve true
      }

      return false;
    });
  }
}
