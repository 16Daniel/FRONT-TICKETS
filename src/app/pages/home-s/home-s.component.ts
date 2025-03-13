import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Sucursal } from '../../models/sucursal.model';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Ticket } from '../../models/ticket.model';
import { TicketsService } from '../../services/tickets.service';
import { ModalGenerateTicketComponent } from '../../modals/tickets/modal-generate-ticket/modal-generate-ticket.component';
import { ModalTicketDetailComponent } from '../../modals/tickets/modal-ticket-detail/modal-ticket-detail.component';
import { ModalFilterTicketsComponent } from '../../modals/tickets/modal-filter-tickets/modal-filter-tickets.component';
import { ModalTicketsHistoryComponent } from '../../modals/tickets/modal-tickets-history/modal-tickets-history.component';
import { ModalTenXtenMaintenanceCheckComponent } from '../../modals/maintenance/modal-ten-xten-maintenance-check/modal-ten-xten-maintenance-check.component';
import { Mantenimiento10x10 } from '../../models/mantenimiento-10x10.model';
import { Maintenance10x10Service } from '../../services/maintenance-10x10.service';
import { ModalTenXtenMaintenanceHistoryComponent } from '../../modals/maintenance/modal-ten-xten-maintenance-history/modal-ten-xten-maintenance-history.component';
import { Usuario } from '../../models/usuario.model';
import { Area } from '../../models/area';
import { ModalTenXtenMaintenanceNewComponent } from '../../modals/maintenance/modal-ten-xten-maintenance-new/modal-ten-xten-maintenance-new.component';
import { PriorityTicketsAccordionSComponent } from '../../components/tickets/priority-tickets-accordion-s/priority-tickets-accordion-s.component';
import { AccordionBranchMaintenance10x10Component } from '../../components/maintenance/accordion-branch-maintenance10x10/accordion-branch-maintenance10x10.component';

@Component({
  selector: 'app-home-s',
  standalone: true,
  imports: [
    TableModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    ModalGenerateTicketComponent,
    ModalTicketDetailComponent,
    ModalFilterTicketsComponent,
    ModalTicketsHistoryComponent,
    ModalTenXtenMaintenanceCheckComponent,
    ModalTenXtenMaintenanceHistoryComponent,
    FormsModule,
    PriorityTicketsAccordionSComponent,
    ModalTenXtenMaintenanceNewComponent,
    AccordionBranchMaintenance10x10Component,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './home-s.component.html',
})
export default class homeSComponent implements OnInit {
  showModalGenerateTicket: boolean = false;
  showModalFilterTickets: boolean = false;
  showModalTicketDetail: boolean = false;
  showModalHistorial: boolean = false;
  showModal10x10: boolean = false;
  ShowModal10x10New: boolean = false;
  showModalHistorialMantenimientos: boolean = false;
  itemtk: Ticket | undefined;
  sucursal: Sucursal | undefined;
  tickets: Ticket[] = [];
  todosLosTickets: Ticket[] = [];
  mantenimientoActivo: Mantenimiento10x10 | null = null;
  formdepto: any;
  areas: Area[] = [];
  subscriptiontk: Subscription | undefined;
  usuario: Usuario;
  selectedtk: Ticket | undefined;
  loading: boolean = false;
  arr_ultimosmantenimientos: Mantenimiento10x10[] = [];
  private unsubscribe!: () => void;
  ordenarxmantenimiento: boolean = false;
  paginaCargaPrimeraVez: boolean = true;
  ultimoNuevoTicket: Ticket | null = null;

  constructor(
    public cdr: ChangeDetectorRef,
    private ticketsService: TicketsService,
    private mantenimientoService: Maintenance10x10Service,
    private messageService: MessageService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    let idu = this.usuario.uid;
    this.getTicketsResponsable(idu);
    this.sucursal = this.usuario.sucursales[0];
    this.formdepto = this.sucursal;
  }

  ngOnInit(): void {
    this.obtnerUltimosMantenimientos();
  }

  obtnerUltimosMantenimientos() {
    let sucursales: Sucursal[] = this.usuario.sucursales;
    let array_ids_Sucursales: string[] = [];

    for (let item of sucursales) {
      array_ids_Sucursales.push(item.id);
    }

    this.loading = true;
    this.subscriptiontk = this.mantenimientoService
      .obtenerUltimosMantenimientos(array_ids_Sucursales)
      .subscribe({
        next: (data) => {
          this.arr_ultimosmantenimientos = data.filter(
            (elemento): elemento is Mantenimiento10x10 => elemento !== null
          );
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al escuchar los tickets:', error);
        },
      });
  }

  ngOnDestroy() {
    if (this.subscriptiontk != undefined) {
      this.subscriptiontk.unsubscribe();
    }

    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  async getTicketsResponsable(userid: string): Promise<void> {
    this.loading = true;
    this.subscriptiontk = this.ticketsService
      .getTicketsResponsable(userid)
      .subscribe({
        next: (data) => {
          if (
            data.length > this.todosLosTickets.length &&
            !this.paginaCargaPrimeraVez
          ) {
            this.tickets = data;
            this.todosLosTickets = data;

            this.ultimoNuevoTicket = this.tickets[this.tickets.length - 1];
            this.showMessage('info', 'Nuevo ticket asignado', 'Sucursal: ' + this.usuario.sucursales.filter(x => x.id == this.ultimoNuevoTicket?.idSucursal)[0].nombre, 100000);
          }
          else {
            this.tickets = data;
            this.todosLosTickets = data;
          }

          this.paginaCargaPrimeraVez = false;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al escuchar los tickets:', error);
        },
      });
  }

  obtenerBackgroundColorPrioridad(value: string): string {
    let str = '';

    if (value == 'ALTA') {
      str = '#ff0000';
    }

    if (value == 'MEDIA') {
      str = '#ffe800';
    }

    if (value == 'BAJA') {
      str = '#61ff00';
    }
    return str;
  }

  obtenerNombreArea(idp: string): string {
    let nombre = '';
    let area = this.areas.filter((x) => x.id == idp);
    if (area.length > 0) {
      nombre = area[0].nombre;
    }
    return nombre;
  }

  async obtenerMantenimientoActivo() {
    this.unsubscribe = this.mantenimientoService.getMantenimientoActivo(
      this.sucursal?.id,
      (mantenimiento) => {
        this.mantenimientoActivo = mantenimiento;
        this.cdr.detectChanges();
      }
    );
  }

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.itemtk = ticket;
    this.showModalTicketDetail = true;

    setTimeout(() => {
      var accordionItems = document.querySelectorAll('.accordion-collapse');
      accordionItems.forEach(function (item) {
        item.classList.remove('show'); // Cierra todas las secciones del accordion
      });
    }, 50);
  }

  showMessage(sev: string, summ: string, det: string, timeout : number = 3000) {
    this.messageService.add({ severity: sev, summary: summ, detail: det, life: timeout  });
  }

  // nuevoMantenimiento() {
  //   this.ShowModal10x10New = true;
  // }
}
