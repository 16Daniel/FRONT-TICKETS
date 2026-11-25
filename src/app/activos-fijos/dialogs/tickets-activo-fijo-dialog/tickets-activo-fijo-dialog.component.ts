import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

import { Ticket } from '../../../tickets/models/ticket.model';
import { TicketsService } from '../../../tickets/services/tickets.service';
import { RequesterTicketsListComponent } from '../../../tickets/components/requester-tickets-list/requester-tickets-list.component';
import { DetalleTicketDialogComponent } from '../../../tickets/dialogs/detalle-ticket-dialog/detalle-ticket-dialog.component';
import { ActivoFijo } from '../../models/activo-fijo.model';

@Component({
  selector: 'app-tickets-activo-fijo-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, RequesterTicketsListComponent, DetalleTicketDialogComponent],
  templateUrl: './tickets-activo-fijo-dialog.component.html',
  styleUrl: './tickets-activo-fijo-dialog.component.scss',
})
export class TicketsActivoFijoDialogComponent implements OnInit {
  @Input() mostrarModalDetalleActivoFijo: boolean = false;
  @Input() activoFijo: ActivoFijo | any;
  @Output() closeEvent = new EventEmitter<boolean>();

  tickets: Ticket[] = [];
  mostrarModalTicketDetail: boolean = false;
  ticket: Ticket | undefined;
  loading: boolean = false;

  constructor(
    private ticketsService: TicketsService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.obtenerTickets();
  }

  onHide(): void {
    this.closeEvent.emit(false);
  }

  async obtenerTickets(): Promise<void> {
    if (!this.activoFijo) return;
    this.loading = true;
    this.cdr.detectChanges();
    try {
      this.tickets = await this.ticketsService.obtenerTicketsPorActivo(this.activoFijo);
    } catch (error) {
      console.error('Error al obtener tickets del activo fijo:', error);
      this.tickets = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  abrirModalDetalleTicket(ticket: Ticket | any): void {
    this.ticket = ticket;
    this.mostrarModalTicketDetail = true;
  }
}
