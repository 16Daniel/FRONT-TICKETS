import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Subscription } from 'rxjs';
import { TicketsService } from '../../../services/tickets.service';
import { Ticket } from '../../../models/ticket.model';
import { RequesterTicketsListComponent } from '../../../components/tickets/requester-tickets-list/requester-tickets-list.component';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { ModalFilterTicketsComponent } from '../modal-filter-tickets/modal-filter-tickets.component';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
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
    if (this.usuario.idRol == '2') {

      this.obtenerTicketsPorUsuario(this.usuario.id);
    }
    else {
      this.obtenerHistorialticketsPorResponsable(this.usuario.id);
    }
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
      (tickets: any) => {
        if (tickets) {
          this.tickets = tickets;
          this.tickets = this.ordenar(this.tickets);
        } else {
          this.showMessage(
            'warning',
            'Atención!',
            'No se encontró información'
          );
        }
        this.todosLosTickets = [...this.tickets];
        this.cdr.detectChanges();
      }
    );
  }

  async obtenerHistorialticketsPorResponsable(userid: string): Promise<void> {
    this.unsubscribe = this.ticketsService.getHistorialticketsPorResponsable(
      this.fechaInicio,
      this.fechaFin,
      userid,
      (tickets: any) => {
        if (tickets) {
          this.tickets = tickets;
          this.tickets = this.ordenar(this.tickets);
        } else {
          this.showMessage(
            'warning',
            'Atención!',
            'No se encontró información'
          );
        }
        this.todosLosTickets = [...this.tickets];
        this.cdr.detectChanges();
      }
    );
  }

  ordenar(tickets: Ticket[]) {
    let arr_temp: Ticket[] = [];

    if (!this.paginaCargaPrimeraVez) { this.showMessage('success', 'Success', 'Información localizada'); }
    this.paginaCargaPrimeraVez = false;

    let temp1: Ticket[] = tickets.filter(
      (x) => x.idPrioridadTicket == '1'
    );
    let temp2: Ticket[] = tickets.filter(
      (x) => x.idPrioridadTicket == '2'
    );
    let temp3: Ticket[] = tickets.filter(
      (x) => x.idPrioridadTicket == '3'
    );
    let temp4: Ticket[] = tickets.filter(
      (x) => x.idPrioridadTicket == '4'
    );

    temp1 = temp1.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    temp2 = temp2.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    temp3 = temp3.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    temp4 = temp4.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    arr_temp = [...temp1, ...temp2, ...temp3, ...temp4];

    return arr_temp;
  }

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.itemtk = ticket;
    this.showModalTicketDetail = true;
  }

  buscar() {
    this.obtenerTicketsPorUsuario(this.usuario.id);
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
