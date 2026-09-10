import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { MultiSelectModule } from 'primeng/multiselect';
import { Subscription } from 'rxjs';

import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Ticket } from '../../interfaces/ticket.model';
import { TicketsService } from '../../services/tickets.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { DashboardTasksPageComponent } from '../../../tareas/pages/dashboard-tasks-page/dashboard-tasks-page';
import { EisenhowerMatrixPageComponent } from '../../../tareas/pages/eisenhower-matrix-page/eisenhower-matrix-page';
import { BranchesOilTabComponent } from '../../../aceites/components/branches-oil-tab/branches-oil-tab.component';
import { ComensalesPage } from "../../../comensales/pages/comensales-page/comensales-page";
import { BranchesSysTabComponent } from '../branches-sys-tab/branches-sys-tab.component';
import { BranchesAudioVideoTabComponent } from '../branches-audio-video-tab/branches-audio-video-tab.component';
import { BranchesMaintenanceTabComponent } from '../branches-maintenance-tab/branches-maintenance-tab.component';
import { SucursalCadenaSuministrosTabComponent } from "../sucursal-cadena-suministros-tab/sucursal-cadena-suministros-tab.component";

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
    BranchesMaintenanceTabComponent,
    BranchesOilTabComponent,
    EisenhowerMatrixPageComponent,
    DashboardTasksPageComponent,
    ComensalesPage,
    SucursalCadenaSuministrosTabComponent
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

  verEisenhower: boolean = false;
  esEspectadorActivo: boolean = false;
  sucursalesSeleccionadas: Sucursal[] = [];
  public tabindex: number = 0;
  private unsubscribe!: () => void;

  constructor(
    private ticketsService: TicketsService,
    public cdr: ChangeDetectorRef,
    private sucursalesService: BranchesService,) {
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
      this.sucursal = this.sucursales.filter(x => x.id == this.usuario.sucursales[0].id)[0];
      this.cdr.detectChanges();

    });
  }

  private ordenarTickets(tickets: Ticket[]): Ticket[] {
    return [...tickets].sort((a, b) => {
      const scoreA = (a as any).score || (((a as any).criticidad && (a as any).urgencia) ? (a as any).criticidad * (a as any).urgencia : 4);
      const scoreB = (b as any).score || (((b as any).criticidad && (b as any).urgencia) ? (b as any).criticidad * (b as any).urgencia : 4);
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      const timeA = a.fecha?.toDate ? a.fecha.toDate().getTime() : (a.fecha ? new Date(a.fecha).getTime() : 0);
      const timeB = b.fecha?.toDate ? b.fecha.toDate().getTime() : (b.fecha ? new Date(b.fecha).getTime() : 0);
      return timeB - timeA;
    });
  }

  async obtenerTicketsPorSucursal(idSucursal: string | any): Promise<void> {
    this.loading = true;
    this.subscripcionTicket = this.ticketsService
      .getByBranchId(idSucursal)
      .subscribe({
        next: (data) => {
          console.log(data)
          this.tickets = this.ordenarTickets(data);
          this.todosLosTickets = [...this.tickets];

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
          this.tickets = this.ordenarTickets(data);
          this.todosLosTickets = [...this.tickets];

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

  onToggleEisenhower() {
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 500);
  }
}
