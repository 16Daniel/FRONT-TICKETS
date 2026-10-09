import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ticket } from '../../interfaces/ticket.model';
import { MatrizUrgencia } from '../../../categorias/interfaces/matriz-urgencia.interface';
import { TicketSlaGaugeComponent } from '../ticket-sla-gauge/ticket-sla-gauge.component';
import { DetalleTicketDialogComponent } from '../../dialogs/detalle-ticket-dialog/detalle-ticket-dialog.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-pending-tickets-list',
  standalone: true,
  imports: [CommonModule, TicketSlaGaugeComponent, DetalleTicketDialogComponent],
  providers: [MessageService],
  templateUrl: './pending-tickets-list.component.html',
  styleUrl: './pending-tickets-list.component.scss'
})
export class PendingTicketsListComponent {
  @Input() tickets: Ticket[] = [];
  @Input() matrizUrgencia: MatrizUrgencia | undefined;
  @Input() tituloContexto: string = '';
  @Input() tituloSeccion: string = 'Tickets Pendientes';

  showTicketDialog = false;
  selectedTicketForDialog: Ticket | null = null;

  abrirDetalleTicket(ticket: Ticket): void {
    this.selectedTicketForDialog = ticket;
    this.showTicketDialog = true;
  }

  cerrarDetalleTicket(): void {
    this.showTicketDialog = false;
    this.selectedTicketForDialog = null;
  }
}
