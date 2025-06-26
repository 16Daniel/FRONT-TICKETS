import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

import { RequesterTicketsListComponent } from '../../../components/common/requester-tickets-list/requester-tickets-list.component';
import { Ticket } from '../../../models/ticket.model';
import { TicketsService } from '../../../services/tickets.service';

@Component({
  selector: 'app-modal-fixed-assets-detail',
  standalone: true,
  imports: [CommonModule, DialogModule, RequesterTicketsListComponent],
  templateUrl: './modal-fixed-assets-detail.component.html',
  styleUrl: './modal-fixed-assets-detail.component.scss'
})

export class ModalFixedAssetsDetailComponent implements OnInit {
  @Input() mostrarModalDetalleActivoFijo: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  tickets: Ticket[] = [];

  constructor(private ticketsService: TicketsService, private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.obtenerTickets();
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  async obtenerTickets() {
    this.tickets = await this.ticketsService.getByReferencia('RW02MBE2');
    this.cdr.detectChanges();

    console.log(this.tickets)
  }
}
