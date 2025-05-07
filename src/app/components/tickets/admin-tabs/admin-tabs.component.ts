import { ChangeDetectorRef, Component} from '@angular/core';
import { TicketsService } from '../../../services/tickets.service';
import { Sucursal } from '../../../models/sucursal.model';
import { Usuario } from '../../../models/usuario.model';
import { Subscription } from 'rxjs';
import { Ticket } from '../../../models/ticket.model';
import { TabViewModule } from 'primeng/tabview';
import { AdminSysTabComponent } from "../admin-sys-tab/admin-sys-tab.component";

@Component({
  selector: 'app-admin-tabs',
  standalone: true,
  imports: [TabViewModule, AdminSysTabComponent],
  templateUrl: './admin-tabs.component.html',
})
export class AdminTabsComponent {
  sucursal: Sucursal;
  usuario: Usuario;
  subscripcionTicket: Subscription | undefined;
  loading: boolean = false;
  tickets: Ticket[] = [];
  public todosLostickets: Ticket[] = [];
  ticket: Ticket | undefined;

  private unsubscribe!: () => void;

  constructor(private ticketsService: TicketsService, private cdr: ChangeDetectorRef,

  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];

    this.obtenerTickets();

  }

  ngOnDestroy() {
    if (this.subscripcionTicket != undefined) {
      this.subscripcionTicket.unsubscribe();
    }

    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  async obtenerTickets(): Promise<void> {
    this.subscripcionTicket = this.ticketsService.get().subscribe({
      next: (data) => {
        this.tickets = data;
        let arr_temp: Ticket[] = [];
        let temp1: Ticket[] = this.tickets.filter(
          (x) => x.idPrioridadTicket == '1'
        );
        let temp2: Ticket[] = this.tickets.filter(
          (x) => x.idPrioridadTicket == '2'
        );
        let temp3: Ticket[] = this.tickets.filter(
          (x) => x.idPrioridadTicket == '3'
        );
        let temp4: Ticket[] = this.tickets.filter(
          (x) => x.idPrioridadTicket == '4'
        );

        temp1 = temp1.sort(
          (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
        );

        temp2 = temp2.sort(
          (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
        );

        temp3 = temp3.sort(
          (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
        );

        temp4 = temp4.sort(
          (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
        );
        arr_temp = [...temp1, ...temp2, ...temp3, ...temp4];
        this.todosLostickets = [...arr_temp];
        this.tickets = arr_temp;

        if (this.ticket != undefined) {
          let temp = this.tickets.filter((x) => x.id == this.ticket!.id);
          if (temp.length > 0) {
            this.ticket = temp[0];
          }
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al escuchar los tickets:', error);
      },
    });
  }

  filtrarTicketsPorArea = (idArea: string) => this.tickets.filter(x => x.idArea == idArea);
}
