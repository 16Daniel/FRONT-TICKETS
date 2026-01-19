import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

import { Ticket } from '../../../models/ticket.model';
import { TicketsService } from '../../../services/tickets.service';
import { ActivoFijo } from '../../../models/activo-fijo.model';
import { ModalTicketDetailComponent } from '../../tickets/modal-ticket-detail/modal-ticket-detail.component';
import { RequesterTicketsListComponent } from '../../../components/requester-tickets-list/requester-tickets-list.component';

@Component({
  selector: 'app-modal-fixed-asset-tickets',
  standalone: true,
  imports: [CommonModule, DialogModule, RequesterTicketsListComponent, ModalTicketDetailComponent],
  templateUrl: './modal-fixed-asset-tickets.component.html',
  styleUrl: './modal-fixed-asset-tickets.component.scss'
})

export class ModalFixedAssetTicketsComponent implements OnInit {
  @Input() mostrarModalDetalleActivoFijo: boolean = false;
  @Input() activoFijo: ActivoFijo | any;
  @Output() closeEvent = new EventEmitter<boolean>();
  tickets: Ticket[] = [];
  mostrarModalTicketDetail: boolean = false;
  ticket: Ticket | undefined;

  constructor(private ticketsService: TicketsService, private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.obtenerTickets();
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  async obtenerTickets() {
    this.tickets = await this.ticketsService.obtenerTicketsPorActivo(this.activoFijo);
    this.cdr.detectChanges();
  }

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.ticket = ticket;
    this.mostrarModalTicketDetail = true;
  }
}
