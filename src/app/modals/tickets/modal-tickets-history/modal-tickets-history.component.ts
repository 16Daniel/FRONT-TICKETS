import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';

import { TicketsService } from '../../../services/tickets.service';
import { Ticket } from '../../../models/ticket.model';
import { RequesterTicketsListComponent } from '../../../components/tickets/requester-tickets-list/requester-tickets-list.component';
import { ModalFilterTicketsComponent } from '../modal-filter-tickets/modal-filter-tickets.component';
import { ModalTicketDetailComponent } from '../modal-ticket-detail/modal-ticket-detail.component';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-modal-tickets-history',
  standalone: true,
  imports: [
    DialogModule,
    RequesterTicketsListComponent,
    CalendarModule,
    FormsModule,
    ModalFilterTicketsComponent,
    CommonModule,
    ModalTicketDetailComponent,
  ],
  templateUrl: './modal-tickets-history.component.html',
  styleUrl: './modal-tickets-history.component.scss',
})
export class ModalTicketsHistoryComponent implements OnDestroy, OnInit {
  @Input() showModalHistorial: boolean = false;
  @Input() idArea: string = '1';
  @Output() closeEvent = new EventEmitter<boolean>();

  showModalFilterTickets: boolean = false;
  private unsubscribe!: () => void;
  usuario: Usuario;
  fechaInicio: Date = new Date();
  fechaFin: Date = new Date();
  tickets: Ticket[] = [];
  todosLosTickets: Ticket[] = [];
  paginaCargaPrimeraVez: boolean = true;
  itemtk: Ticket | undefined;
  showModalTicketDetail: boolean = false;

  constructor(
    private ticketsService: TicketsService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.buscar();
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  async obtenerTicketsPorUsuario(userid: string): Promise<void> {
    this.unsubscribe = this.ticketsService.getHistorialTicketsPorUsuario(
      this.fechaInicio,
      this.fechaFin,
      userid,
      this.idArea,
      (tickets: any) => {
        if (tickets) {
          this.tickets = tickets;
          // if (!this.paginaCargaPrimeraVez) {
            // this.showMessage('success', 'Success', 'Información localizada');
          // }
        } else {
          if (!this.paginaCargaPrimeraVez) {
            this.showMessage(
              'warn',
              'Atención!',
              'No se encontró información'
            );
          }
        }
        this.paginaCargaPrimeraVez = false;
        this.todosLosTickets = [...this.tickets];
        this.cdr.detectChanges();
      }
    );
  }

  async obtenerHistorialTicketsPorResponsable(userid: string): Promise<void> {
    this.unsubscribe = this.ticketsService.getHistorialTicketsPorResponsable(
      this.fechaInicio,
      this.fechaFin,
      userid,
      (tickets: any) => {
        if (tickets) {
          this.tickets = tickets;
          // if (!this.paginaCargaPrimeraVez) {
            // this.showMessage('success', 'Success', 'Información localizada');
          // }
        } else {
          if (!this.paginaCargaPrimeraVez) {
            this.showMessage(
              'warn',
              'Atención!',
              'No se encontró información'
            );
          }
        }
        this.paginaCargaPrimeraVez = false;
        this.todosLosTickets = [...this.tickets];
        this.cdr.detectChanges();
      }
    );
  }

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.itemtk = ticket;
    this.showModalTicketDetail = true;
  }

  buscar() {
    if (this.usuario.idRol == '2') {

      this.obtenerTicketsPorUsuario(this.usuario.id);
    }
    else {
      this.obtenerHistorialTicketsPorResponsable(this.usuario.id);
    }
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
