import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';

import { Sucursal } from '../../models/sucursal.model';
import { Ticket } from '../../models/ticket.model';
import { Usuario } from '../../models/usuario.model';
import { Area } from '../../models/area';
import { TicketsService } from '../../services/tickets.service';
import { ModalGenerateTicketComponent } from '../../modals/tickets/modal-generate-ticket/modal-generate-ticket.component';
import { ModalTicketDetailComponent } from '../../modals/tickets/modal-ticket-detail/modal-ticket-detail.component';
import { ModalFilterTicketsComponent } from '../../modals/tickets/modal-filter-tickets/modal-filter-tickets.component';
import { ModalTicketsHistoryComponent } from '../../modals/tickets/modal-tickets-history/modal-tickets-history.component';
import { PriorityTicketsAccordionComponent } from '../../components/tickets/priority-tickets-accordion/priority-tickets-accordion.component';
import { ModalTenXtenMaintenanceCheckComponent } from '../../modals/maintenance/modal-ten-xten-maintenance-check/modal-ten-xten-maintenance-check.component';
import { Mantenimiento10x10 } from '../../models/mantenimiento-10x10.model';
import { Maintenance10x10Service } from '../../services/maintenance-10x10.service';
import { ModalTenXtenMaintenanceHistoryComponent } from '../../modals/maintenance/modal-ten-xten-maintenance-history/modal-ten-xten-maintenance-history.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    ModalGenerateTicketComponent,
    ModalTicketDetailComponent,
    ModalFilterTicketsComponent,
    ModalTicketsHistoryComponent,
    PriorityTicketsAccordionComponent,
    ModalTenXtenMaintenanceCheckComponent,
    ModalTenXtenMaintenanceHistoryComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './home.component.html',
})
export default class HomeComponent {
  mostrarModalGenerateTicket: boolean = false;
  mostrarModalFilterTickets: boolean = false;
  mostrarModalTicketDetail: boolean = false;
  mostrarModalHistorial: boolean = false;
  mostrarModal10x10: boolean = false;
  mostrarModalHistorialMantenimientos: boolean = false;

  sucursal: Sucursal | undefined;
  tickets: Ticket[] = [];
  todosLosTickets: Ticket[] = [];
  mantenimientoActivo: Mantenimiento10x10 | null = null;
  areas: Area[] = [];
  usuario: Usuario;
  loading: boolean = false;
  subscripcionTicket: Subscription | undefined;
  ticket: Ticket | undefined;

  private unsubscribe!: () => void;

  constructor(
    public cdr: ChangeDetectorRef,
    private ticketsService: TicketsService,
    private mantenimientoService: Maintenance10x10Service
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];

    this.obtenerTicketsPorSucursal(this.sucursal?.id);
    this.obtenerMantenimientoActivo();
  }

  ngOnDestroy() {
    if (this.subscripcionTicket != undefined) {
      this.subscripcionTicket.unsubscribe();
    }

    if (this.unsubscribe) {
      this.unsubscribe();
    }
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
            (x) => x.prioridadSucursal == 'PÁNICO'
          );
          let temp2: Ticket[] = this.tickets.filter(
            (x) => x.prioridadSucursal == 'ALTA'
          );
          let temp3: Ticket[] = this.tickets.filter(
            (x) => x.prioridadSucursal == 'MEDIA'
          );
          let temp4: Ticket[] = this.tickets.filter(
            (x) => x.prioridadSucursal == 'BAJA'
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

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.ticket = ticket;
    this.mostrarModalTicketDetail = true;

    setTimeout(() => {
      var accordionItems = document.querySelectorAll('.accordion-collapse');
      accordionItems.forEach(function (item) {
        item.classList.remove('show'); // Cierra todas las secciones del accordion
      });
    }, 50);
  }

  obtenerNombreArea(idp: string): string {
    let nombre = '';
    let area = this.areas.filter((x) => x.id == idp);
    if (area.length > 0) {
      nombre = area[0].nombre;
    }
    return nombre;
  }

  filtrarTicketsPorSucursal(idSucursal: number | any) {
    return this.tickets.filter((x) => x.idSucursal == idSucursal);
  }

  async obtenerMantenimientoActivo() {
    this.unsubscribe = this.mantenimientoService.getMantenimientoActivo(
      this.sucursal?.id,
      (mantenimiento) => {
        this.mantenimientoActivo = mantenimiento;
        this.cdr.detectChanges();
        // console.log('Mantenimiento activo:', this.mantenimientoActivo);
      }
    );
  }
}
