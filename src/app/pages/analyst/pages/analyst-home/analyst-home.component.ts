import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subscription } from 'rxjs';

import { Sucursal } from '../../../../models/sucursal.model';
import { Ticket } from '../../../../models/ticket.model';
import { TicketsService } from '../../../../services/tickets.service';
import { ModalGenerateTicketComponent } from '../../../../modals/tickets/modal-generate-ticket/modal-generate-ticket.component';
import { ModalTicketDetailComponent } from '../../../../modals/tickets/modal-ticket-detail/modal-ticket-detail.component';
import { ModalFilterTicketsComponent } from '../../../../modals/tickets/modal-filter-tickets/modal-filter-tickets.component';
import { ModalTicketsHistoryComponent } from '../../../../modals/tickets/modal-tickets-history/modal-tickets-history.component';
import { Mantenimiento10x10 } from '../../../../models/mantenimiento-10x10.model';
import { Maintenance10x10Service } from '../../../../services/maintenance-10x10.service';
import { Usuario } from '../../../../models/usuario.model';
import { Area } from '../../../../models/area.model';
import { UsersService } from '../../../../services/users.service';
import { BranchesService } from '../../../../services/branches.service';
import { NotificationService } from '../../../../services/notification.service';
import { AccordionBranchMaintenance10x10Component } from '../../../../components/maintenance/systems/accordion-branch-maintenance10x10/accordion-branch-maintenance10x10.component';
import { ModalTenXtenMaintenanceCheckComponent } from '../../../../modals/maintenance/systems/modal-ten-xten-maintenance-check/modal-ten-xten-maintenance-check.component';
import { ModalTenXtenMaintenanceHistoryComponent } from '../../../../modals/maintenance/systems/modal-ten-xten-maintenance-history/modal-ten-xten-maintenance-history.component';
import { ModalTenXtenMaintenanceNewComponent } from '../../../../modals/maintenance/systems/modal-ten-xten-maintenance-new/modal-ten-xten-maintenance-new.component';
import { AccordionBranchMaintenanceAvComponent } from '../../../../components/maintenance/audio-video/accordion-branch-maintenance-av/accordion-branch-maintenance-av.component';
import { AccordionBranchMaintenanceMttoComponent } from '../../../../components/maintenance/maintenance/accordion-branch-maintenance-mtto/accordion-branch-maintenance-mtto.component';
import { MantenimientoFactoryService } from '../../../../services/maintenance-factory.service';
import { PriorityTicketsAccordionAnalystComponent } from '../../components/priority-tickets-accordion-analyst/priority-tickets-accordion-analyst.component';
import { ModalRequestPurchaseComponent } from '../../dialogs/modal-request-purchase/modal-request-purchase.component';

@Component({
  selector: 'app-analyst-home',
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
    PriorityTicketsAccordionAnalystComponent,
    ModalTenXtenMaintenanceNewComponent,
    AccordionBranchMaintenance10x10Component,
    AccordionBranchMaintenanceAvComponent,
    AccordionBranchMaintenanceMttoComponent,
    ModalRequestPurchaseComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './analyst-home.component.html',
})

export default class AnalystHomeComponent implements OnInit {
  mostrarModalGenerateTicket: boolean = false;
  mostrarModalFilterTickets: boolean = false;
  mostrarModalTicketDetail: boolean = false;
  mostrarModalHistorial: boolean = false;
  mostrarModal10x10: boolean = false;
  mostrarModal10x10New: boolean = false;
  mostrarModalHistorialMantenimientos: boolean = false;
  itemtk: Ticket | undefined;
  sucursal: Sucursal | undefined;
  tickets: Ticket[] = [];
  todosLosTickets: Ticket[] = [];
  mantenimientoActivo: Mantenimiento10x10 | null = null;
  areas: Area[] = [];
  subscriptiontk: Subscription | undefined;
  usuario: Usuario;
  selectedtk: Ticket | undefined;
  loading: boolean = false;
  ultimosmantenimientos: any[] = [];
  private unsubscribe!: () => void;
  ordenarxmantenimiento: boolean = false;
  paginaCargaPrimeraVez: boolean = true;
  ultimoNuevoTicket: Ticket | null = null;
  sucursales: Sucursal[] = [];
  todasSucursales: Sucursal[] = [];
  tituloMantenimiento: string = '';
  ordenarMantenimientosFecha: boolean = false;
  auxMostrarMantenimientos = true;
  mostrarModalCompras: boolean = false;

  constructor(
    public cdr: ChangeDetectorRef,
    private ticketsService: TicketsService,
    private mantenimientoSysService: Maintenance10x10Service,
    private messageService: MessageService,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private notificationService: NotificationService,
    private mantenimientoFactory: MantenimientoFactoryService

  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];

    switch (this.usuario.idArea) {
      case '1':
        this.tituloMantenimiento = '10X10';
        break;

      case '2':
        this.tituloMantenimiento = '6X6';
        break;

      case '4':
        this.tituloMantenimiento = '8X8';
        break;
    }
  }

  ngOnInit(): void {
    this.getTicketsResponsable();
    this.obtnerUltimosMantenimientos();
    this.obtenerSucursales();
    this.notificationService.solicitarPermiso();
  }

  ngOnDestroy() {
    if (this.subscriptiontk != undefined) {
      this.subscriptiontk.unsubscribe();
    }

    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  obtnerUltimosMantenimientos() {
    let sucursales: Sucursal[] = this.usuario.sucursales;
    let idsSucursales: string[] = [];

    for (let item of sucursales) {
      idsSucursales.push(item.id);
    }

    this.loading = true;

    this.obtenerMantenimientos(idsSucursales);
  }

  obtenerMantenimientos(idsSucursales: string[]) {
    const servicio = this.mantenimientoFactory.getService(this.usuario.idArea);

    this.subscriptiontk = servicio
      .getUltimosMantenimientos(idsSucursales)
      .subscribe((result: any) => {
        let data = result.filter((element: any) => element.length > 0);
        this.ultimosmantenimientos = [];
        for (let itemdata of data) {
          for (let item of itemdata) {
            this.ultimosmantenimientos.push(item);
          }
        }

        this.ultimosmantenimientos = this.ultimosmantenimientos.map(x => {
          x.fecha = this.getDate(x.fecha);
          return x;
        });
        this.cdr.detectChanges();
      });
  }

  obtenerMantenimientosSistemas(idsSucursales: string[]) {
    const servicio = this.mantenimientoFactory.getService(this.usuario.idArea);

    this.subscriptiontk = servicio
      .getUltimosMantenimientos(idsSucursales)
      .subscribe((result: any) => {
        let data = result.filter((element: any) => element.length > 0);
        this.ultimosmantenimientos = [];
        for (let itemdata of data) {
          for (let item of itemdata) {
            this.ultimosmantenimientos.push(item);
          }
        }

        this.ultimosmantenimientos = this.ultimosmantenimientos.map(x => {
          x.fecha = this.getDate(x.fecha);
          return x;
        });
        this.cdr.detectChanges();
      });
  }

  getDate(tsmp: Timestamp | any): Date {
    try {
      // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
      const firestoreTimestamp = tsmp; // Ejemplo
      const date = firestoreTimestamp.toDate(); // Convierte a Date
      return date;
    } catch {
      return tsmp;
    }
  }

  async getTicketsResponsable(): Promise<void> {
    this.loading = true;

    this.subscriptiontk = this.ticketsService
      .getTicketsResponsable(this.usuario.id, this.usuario.esGuardia, this.usuario.idArea)
      .subscribe({
        next: (data) => {
          if (
            data.length > this.todosLosTickets.length &&
            !this.paginaCargaPrimeraVez
          ) {
            this.tickets = data;
            this.todosLosTickets = data;
            this.ultimoNuevoTicket = this.tickets[0];
            this.notificationService.enviarNotificacion('NUEVO TICKET ASIGNADO', 'SUCURSAL: ' + this.sucursales.filter(x => x.id == this.ultimoNuevoTicket?.idSucursal)[0].nombre);
            this.showMessage('info', 'NUEVO TICKET ASIGNADO', 'SUCURSAL: ' + this.sucursales.filter(x => x.id == this.ultimoNuevoTicket?.idSucursal)[0].nombre, 100000);
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
    this.unsubscribe = this.mantenimientoSysService.getMantenimientoActivo(
      this.sucursal?.id,
      (mantenimiento) => {
        this.mantenimientoActivo = mantenimiento;
        this.cdr.detectChanges();
      }
    );
  }

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.itemtk = ticket;
    this.mostrarModalTicketDetail = true;

    setTimeout(() => {
      var accordionItems = document.querySelectorAll('.accordion-collapse');
      accordionItems.forEach(function (item) {
        item.classList.remove('show'); // Cierra todas las secciones del accordion
      });
    }, 50);
  }

  showMessage(sev: string, summ: string, det: string, timeout: number = 3000) {
    this.messageService.add({ severity: sev, summary: summ, detail: det, life: timeout });
  }

  async onToggleGuardia(usuario: any): Promise<void> {
    if (!usuario || !usuario.id) return;

    try {
      await this.usersService.updateUserGuardStatus(usuario.id, usuario.esGuardia);
      localStorage.setItem('rwuserdatatk', JSON.stringify(usuario));
      // this.sucursales = usuario.esGuardia ? this.todasSucursales : this.usuario.sucursales;
      // this.cdr.detectChanges();
      // this.getTicketsResponsable();
      window.location.reload();
    } catch (error) {
      console.error('Error actualizando modo guardia:', error);
    }
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe(result => {
      this.todasSucursales = result;
      this.sucursales = this.usuario.esGuardia ? result : this.usuario.sucursales;
    });
  }

  filtrarMantenimientos() {
    this.auxMostrarMantenimientos = false;
    setTimeout(() => {
      this.auxMostrarMantenimientos = true;
      this.cdr.detectChanges();
    }, 400);
  }

  sucursalesMantenimeintosActivos = () => {
    const idsSucursalesUsuario = this.usuario.sucursales.map(s => String(s.id));
    return this.todasSucursales.filter(sucursal =>
      idsSucursalesUsuario?.includes(String(sucursal.id)) &&
      Array.isArray(sucursal.activoMantenimientos) &&
      sucursal.activoMantenimientos.includes(this.usuario.idArea)
    );
  }
}
