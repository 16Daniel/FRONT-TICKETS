import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
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
export class ModalTicketsHistoryComponent implements OnDestroy {
  @Input() showModalHistorial: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  showModalFilterTickets: boolean = false;
  // subscriptiontk: Subscription | undefined;
  private unsubscribe!: () => void;
  userdata: any;
  fechaini: Date = new Date();
  fechafin: Date = new Date();
  tickets: Ticket[] = [];
  todosLosTickets: Ticket[] = [];

  itemtk: Ticket | undefined;
  showModalTicketDetail: boolean = false;

  constructor(
    private ticketsService: TicketsService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    let idUsuario = this.userdata.uid;

    this.obtenerTicketsPorUsuario(idUsuario);
  }

  ngOnDestroy() {
    // if (this.subscriptiontk != undefined) {
    //   this.subscriptiontk.unsubscribe();
    // }
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  async obtenerTicketsPorUsuario(userid: string): Promise<void> {
    this.unsubscribe = this.ticketsService.getHistorialticketsPorUsuario(
      this.fechaini,
      this.fechafin,
      userid,
      (tickets: any) => {
        // console.log(tickets);

        this.tickets = tickets;
        let arr_temp: Ticket[] = [];

        if (tickets) {
          let temp1: Ticket[] = this.tickets.filter(
            (x) => x.prioridadsuc == 'PÁNICO'
          );
          let temp2: Ticket[] = this.tickets.filter(
            (x) => x.prioridadsuc == 'ALTA'
          );
          let temp3: Ticket[] = this.tickets.filter(
            (x) => x.prioridadsuc == 'MEDIA'
          );
          let temp4: Ticket[] = this.tickets.filter(
            (x) => x.prioridadsuc == 'BAJA'
          );

          temp1 = temp1.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

          temp2 = temp2.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

          temp3 = temp3.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

          temp4 = temp4.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

          arr_temp = [...temp1, ...temp2, ...temp3, ...temp4];
        }
        this.todosLosTickets = [...arr_temp];
        this.tickets = arr_temp;

        this.cdr.detectChanges();
      }
    );
  }

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.itemtk = ticket;
    this.showModalTicketDetail = true;
  }

  buscar() {
    this.obtenerTicketsPorUsuario(this.userdata.uid);
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
