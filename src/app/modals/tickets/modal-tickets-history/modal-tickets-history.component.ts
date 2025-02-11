import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Subscription } from 'rxjs';
import { TicketsService } from '../../../services/tickets.service';
import { TicketDB } from '../../../models/ticket-db.model';

@Component({
  selector: 'app-modal-tickets-history',
  standalone: true,
  imports: [DialogModule],
  templateUrl: './modal-tickets-history.component.html',
  styleUrl: './modal-tickets-history.component.scss',
})
export class ModalTicketsHistoryComponent {
  @Input() showModalHistorial: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  subscriptiontk: Subscription | undefined;
  userdata: any;
  fechaini: Date = new Date();
  fechafin: Date = new Date();
  tickets: TicketDB[] = [];
  todosLosTickets: TicketDB[] = [];

  constructor(
    private ticketsService: TicketsService,
    private cdr: ChangeDetectorRef
  ) {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    let idUsuario = this.userdata.uid;

    this.getTicketsUser(idUsuario);
  }

  ngOnDestroy() {
    if (this.subscriptiontk != undefined) {
      this.subscriptiontk.unsubscribe();
    }
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  async getTicketsUser(userid: string): Promise<void> {
    this.subscriptiontk = this.ticketsService
      .getHistorialtickets(
        this.fechaini,
        this.fechafin,
        userid,
        this.userdata.idRol
      )
      .subscribe({
        next: (data) => {
          this.tickets = data;
          let arr_temp: TicketDB[] = [];
          let temp1: TicketDB[] = this.tickets.filter(
            (x) => x.prioridadsuc == 'PÁNICO'
          );
          let temp2: TicketDB[] = this.tickets.filter(
            (x) => x.prioridadsuc == 'ALTA'
          );
          let temp3: TicketDB[] = this.tickets.filter(
            (x) => x.prioridadsuc == 'MEDIA'
          );
          let temp4: TicketDB[] = this.tickets.filter(
            (x) => x.prioridadsuc == 'BAJA'
          );

          temp1 = temp1.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

          temp2 = temp2.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

          temp3 = temp3.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

          temp4 = temp4.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
          arr_temp = [...temp1, ...temp2, ...temp3, ...temp4];
          this.todosLosTickets = [...arr_temp];
          this.tickets = arr_temp;

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al escuchar los tickets:', error);
        },
      });
  }
}
