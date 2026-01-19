import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { Sucursal } from '../../../../models/sucursal.model';
import { EstatusTicket } from '../../../../models/estatus-ticket.model';
import { TicketsService } from '../../../../services/tickets.service';
import { Usuario } from '../../../../models/usuario.model';
import { Ticket } from '../../../../models/ticket.model';
import { ModalFilterTicketsComponent } from '../../../../modals/tickets/modal-filter-tickets/modal-filter-tickets.component';
import { ModalGenerateTicketComponent } from '../../../../modals/tickets/modal-generate-ticket/modal-generate-ticket.component';
import { ModalTicketsHistoryComponent } from '../../../../modals/tickets/modal-tickets-history/modal-tickets-history.component';
import { BranchesService } from '../../../../services/branches.service';
import { Maintenance10x10Service } from '../../../../services/maintenance-10x10.service';
import { Mantenimiento10x10 } from '../../../../models/mantenimiento-10x10.model';
import { AccordionBranchMaintenance10x10Component } from '../../../../components/maintenance/systems/accordion-branch-maintenance10x10/accordion-branch-maintenance10x10.component';
import { ModalTicketDetailComponent } from "../../../../modals/tickets/modal-ticket-detail/modal-ticket-detail.component";
import { UserTicketsAccordionComponent } from '../user-tickets-accordion/user-tickets-accordion.component';
import { IconosNotificacionesTicketsComponent } from '../../../../components/iconos-notificaciones-tickets/iconos-notificaciones-tickets.component';
import { ModalPurshasesComponent } from '../../dialogs/modal-purshases/modal-purshases.component';
import { ModalRequestPurchaseComponent } from '../../../../modals/modal-request-purchase/modal-request-purchase.component';
import { PurchaseService } from '../../../../services/purchase.service';
import { Compra } from '../../../../models/compra.model';
import { BranchesTicketsAccordionComponent } from '../branches-tickets-accordion/branches-tickets-accordion.component';
import { UsersService } from '../../../../services/users.service';
import { DatesHelperService } from '../../../../helpers/dates-helper.service';

@Component({
  selector: 'app-admin-sys-tab',
  standalone: true,
  imports: [
    ToastModule,
    CommonModule,
    FormsModule,
    ConfirmDialogModule,
    OverlayPanelModule,
    ModalFilterTicketsComponent,
    ModalGenerateTicketComponent,
    ModalTicketsHistoryComponent,
    BranchesTicketsAccordionComponent,
    UserTicketsAccordionComponent,
    AccordionBranchMaintenance10x10Component,
    ModalTicketDetailComponent,
    IconosNotificacionesTicketsComponent,
    ModalPurshasesComponent,
    ModalRequestPurchaseComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin-sys-tab.component.html',
  styleUrl: './admin-sys-tab.component.scss',
})

export class AdminSysTabComponent {
  @ViewChild(AccordionBranchMaintenance10x10Component) hijo!: AccordionBranchMaintenance10x10Component;

  tickets: Ticket[] = [];
  mostrarModalGenerateTicket: boolean = false;
  mostrarMantenimientos: boolean = false;
  mostrarModalFilterTickets: boolean = false;
  mostrarModalHistorial: boolean = false;
  mostrarAgrupacion: boolean = false;
  mostrarModalTicketDetail: boolean = false;
  mostrarModalCompras: boolean = false;
  mostrarModalSolicitarCompra: boolean = false;
  sucursales: Sucursal[] = [];
  mantenimientos: Mantenimiento10x10[] = [];
  catStatusT: EstatusTicket[] = [];
  subscripcionTicket: Subscription | undefined;
  ticket: Ticket | undefined;
  usuario: Usuario;
  sucursal: Sucursal | undefined;
  usuariosHelp: Usuario[] = [];
  todosLostickets: Ticket[] = [];
  filterarea: any | undefined;
  usergroup: Usuario | undefined;
  idArea: string = '1';
  ordenarMantenimientosFecha: boolean = false;
  compras: Compra[] = [];
  auxMostrarMantenimientos = true;

  constructor(
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private ticketsService: TicketsService,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private maintenanceService: Maintenance10x10Service,
    private purchaseService: PurchaseService,
    private datesHelper: DatesHelperService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];

    this.obtenerTickets();
    this.obtenerUsuariosHelp();
    this.obtenerSucursales();
    this.obtenerCompras();
    this.todosLostickets = this.tickets;
  }

  ngAfterViewInit() {

    setTimeout(() => {
      this.mostrarMantenimientos = true;
      this.cdr.detectChanges();
      this.mostrarMantenimientos = false;
    }, 1500);


  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  async obtenerTickets(): Promise<void> {
    Swal.fire({
      target: document.body,
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor...',
      didOpen: () => Swal.showLoading(),
      customClass: {
        container: 'swal-topmost'
      }
    });

    this.subscripcionTicket = this.ticketsService.getByArea(this.idArea).subscribe({
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

        this.tickets = this.tickets.filter(x => x.validacionAdmin != true);
        this.tickets = this.tickets.map((item: any) => ({
          ...item,
          idCategoria: item.idCategoria.toString()
        }));

        this.cdr.detectChanges();
        setTimeout(() => { Swal.close(); }, 1000);
      },
      error: (error) => {
        console.error('Error al escuchar los tickets:', error);
        Swal.close();
      },
    });
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.maintenanceService
          .getUltimosMantenimientos(
            this.sucursales.map((sucursal) => sucursal.id)
          )
          .subscribe((result) => {
            let data = result.filter((element) => element.length > 0);
            this.mantenimientos = [];
            for (let itemdata of data) {
              for (let item of itemdata) {
                this.mantenimientos.push(item);
              }
            }

            this.mantenimientos = this.mantenimientos.map(x => {
              x.fecha = this.datesHelper.getDate(x.fecha);
              return x;
            });
            this.cdr.detectChanges();
          });

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerUsuariosHelp() {
    this.usersService.getUsuariosPorRol(['4', '7'], this.usuario.idArea)
      .subscribe(usuarios => this.usuariosHelp = usuarios);
  }

  obtenerCompras() {
    this.purchaseService.getByArea(this.idArea).subscribe(result => {
      this.compras = result;
    });
  }

  agrupar(user: Usuario) {
    this.usergroup = user;
    this.mostrarAgrupacion = true;

    if (this.usergroup.idRol === '7') {
      this.tickets = this.tickets.filter(x => x.idUsuarioEspecialista == this.usergroup!.id)
    }
    else {
      this.tickets = this.todosLostickets;
    }
  }

  agruparPorSucursal() {
    this.tickets = this.todosLostickets;
    this.usergroup = undefined;
    this.mostrarAgrupacion = true;
    this.cdr.detectChanges();
  }

  abrirModalDetalleTicket(itemticket: Ticket | any) {
    this.mostrarModalTicketDetail = true;
    this.ticket = itemticket;
  }

  filtrarMantenimientos() {
    this.auxMostrarMantenimientos = false;
    setTimeout(() => {
      this.auxMostrarMantenimientos = true;
      this.cdr.detectChanges();
    }, 400);
  }

  sucursalesMantenimeintosActivos = () => {
    if (this.usergroup !== undefined) {
      const idsSucursalesUsuario = this.usergroup?.sucursales.map(s => String(s.id));
      return this.sucursales.filter(sucursal =>
        idsSucursalesUsuario?.includes(String(sucursal.id)) &&
        Array.isArray(sucursal.activoMantenimientos) &&
        sucursal.activoMantenimientos.includes('1')
      );
    }
    else {
      return this.sucursales.filter(sucursal =>
        Array.isArray(sucursal.activoMantenimientos) &&
        sucursal.activoMantenimientos.includes('1')
      );
    }
  }
}
