import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { Subscription } from 'rxjs';

import { BranchesSysTabComponent } from '../branches-sys-tab/branches-sys-tab.component';
import { BranchesAudioVideoTabComponent } from '../branches-audio-video-tab/branches-audio-video-tab.component';
import { Sucursal } from '../../../models/sucursal.model';
import { Usuario } from '../../../models/usuario.model';
import { TicketsService } from '../../../services/tickets.service';
import { Ticket } from '../../../models/ticket.model';
import { MultiSelectModule } from 'primeng/multiselect';
import { BranchesService } from '../../../services/branches.service';
import { BranchesMaintenanceTabComponent } from '../branches-maintenance-tab/branches-maintenance-tab.component';

@Component({
  selector: 'app-branches-tabs',
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    BranchesSysTabComponent,
    BranchesAudioVideoTabComponent,
    FormsModule,
    MultiSelectModule,
    BranchesMaintenanceTabComponent
  ],
  templateUrl: './branches-tabs.component.html',
  styleUrl: './branches-tabs.component.scss',
})

export class BranchesTabsComponent implements OnDestroy {
  @Output() espectadorEmitter = new EventEmitter<boolean>();

  sucursales: Sucursal[] = [];
  sucursal: Sucursal;
  usuario: Usuario;
  subscripcionTicket: Subscription | undefined;
  loading: boolean = false;
  tickets: Ticket[] = [];
  todosLosTickets: Ticket[] = [];
  ticket: Ticket | undefined;

  esEspectadorActivo: boolean = false;
  sucursalesSeleccionadas: Sucursal[] = [];

  private unsubscribe!: () => void;

  constructor(
    private ticketsService: TicketsService,
    private cdr: ChangeDetectorRef,
    private sucursalesService: BranchesService,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];

    this.obtenerTicketsPorSucursal(this.sucursal?.id);
    this.obtenerSucursales();
  }

  ngOnDestroy() {
    if (this.subscripcionTicket != undefined) {
      this.subscripcionTicket.unsubscribe();
    }

    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  obtenerSucursales() {
    this.sucursalesService.get().subscribe(result => {
      this.sucursales = result;
      this.cdr.detectChanges();

    });
  }

  async obtenerTicketsPorSucursal(idSucursal: string | any): Promise<void> {
    this.loading = true;
    this.subscripcionTicket = this.ticketsService
      .getByBranchId(idSucursal)
      .subscribe({
        next: (data) => {
          // console.log(data);
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
          this.todosLosTickets = [...arr_temp];
          this.tickets = arr_temp;

          if (this.ticket != undefined) {
            let temp = this.tickets.filter((x) => x.id == this.ticket!.id);
            if (temp.length > 0) {
              this.ticket = temp[0];
            }
          }

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al escuchar los tickets:', error);
        },
      });
  }

  async obtenerTodosLosTickets(): Promise<void> {
    this.loading = true;
    this.subscripcionTicket = this.ticketsService
      .get()
      .subscribe({
        next: (data) => {
          // console.log(data);
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
          this.todosLosTickets = [...arr_temp];
          this.tickets = arr_temp;

          if (this.ticket != undefined) {
            let temp = this.tickets.filter((x) => x.id == this.ticket!.id);
            if (temp.length > 0) {
              this.ticket = temp[0];
            }
          }

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al escuchar los tickets:', error);
        },
      });
  }

  filtrarTicketsPorArea = (idArea: string) => {
    let result = this.tickets.filter(x => x.idArea == idArea);
    let idSucursales = this.sucursalesSeleccionadas.map(x => x.id);

    if (!idSucursales || idSucursales.length === 0) return result;

    return result.filter(ticket => idSucursales.includes(ticket.idSucursal));
  };

  onToggleEspectador() {
    if (this.esEspectadorActivo) {
      this.obtenerTodosLosTickets();
    }
    else {
      this.obtenerTicketsPorSucursal(this.sucursal?.id);
    }

    this.espectadorEmitter.emit(this.esEspectadorActivo);

  }

  // onSucursalesChange() {
  //   console.log('Sucursales seleccionadas:', this.sucursalesSeleccionadas.map(x => x.id));
  // }

  // filtrarTicketsPorSucursales(tickets: Ticket[], idSucursales: string[]): Ticket[] {
  //   if (!idSucursales || idSucursales.length === 0) return [];

  //   return tickets.filter(ticket => idSucursales.includes(ticket.idSucursal));
  // }
}
