import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';

import { Ticket } from '../../../models/ticket.model';
import { DatesHelperService } from '../../../helpers/dates-helper.service';
import { TicketsService } from '../../../services/tickets.service';
import { ActivoFijo } from '../../../models/activo-fijo.model';

@Component({
  selector: 'app-modal-fixed-asset-select-ticket',
  standalone: true,
  imports: [CommonModule, DialogModule, TableModule],
  templateUrl: './modal-fixed-asset-select-ticket.component.html',
  styleUrl: './modal-fixed-asset-select-ticket.component.scss'
})
export class ModalFixedAssetSelectTicketComponent implements OnInit {
  @Input() mostrarModal: boolean = false;
  @Input() activoFijo: ActivoFijo | any;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Output() ticketSelectedEvent = new EventEmitter<Ticket>();
  
  tickets: Ticket[] = [];
  ticketSeleccionado: Ticket | undefined;

  constructor(
    public datesHelper: DatesHelperService,
    private ticketsService: TicketsService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.obtenerTickets();
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  obtenerBackgroundColorPrioridad(value: string): string {
    let str = '';

    if (value == '2') {
      str = '#ff0000';
    }

    if (value == '3') {
      str = '#ffe800';
    }

    if (value == '4') {
      str = '#61ff00';
    }

    if (value == '1') {
      str = 'black';
    }
    return str;
  }

  onClick() {
    this.ticketSelectedEvent.emit(this.ticketSeleccionado);
    this.onHide();
  }

  async obtenerTickets() {
    this.tickets = await this.ticketsService.getByReferencia(this.activoFijo?.referencia);
    this.cdr.detectChanges();
  }
}
