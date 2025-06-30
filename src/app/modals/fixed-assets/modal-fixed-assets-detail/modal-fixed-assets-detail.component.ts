import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

import { RequesterTicketsListComponent } from '../../../components/common/requester-tickets-list/requester-tickets-list.component';
import { Ticket } from '../../../models/ticket.model';
import { TicketsService } from '../../../services/tickets.service';
import { ActivoFijo } from '../../../models/activo-fijo.model';
import { ModalTicketDetailComponent } from '../../tickets/modal-ticket-detail/modal-ticket-detail.component';

@Component({
  selector: 'app-modal-fixed-assets-detail',
  standalone: true,
  imports: [CommonModule, DialogModule, RequesterTicketsListComponent, ModalTicketDetailComponent],
  templateUrl: './modal-fixed-assets-detail.component.html',
  styleUrl: './modal-fixed-assets-detail.component.scss'
})

export class ModalFixedAssetsDetailComponent implements OnInit {
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
    this.tickets = await this.ticketsService.getByReferencia(this.activoFijo?.referencia);
    this.cdr.detectChanges();
  }

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.ticket = ticket;
    this.mostrarModalTicketDetail = true;
  }
}
