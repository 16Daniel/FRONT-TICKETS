import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { ModalFilterTicketsComponent } from '../../../tickets/dialogs/modal-filter-tickets/modal-filter-tickets.component';
import { ModalGenerateTicketComponent } from '../../../tickets/dialogs/modal-generate-ticket/modal-generate-ticket.component';
import { ModalTicketsHistoryComponent } from '../../../tickets/dialogs/modal-tickets-history/modal-tickets-history.component';
import { BranchesTicketsAccordionComponent } from '../../../tickets/components/branches-tickets-accordion/branches-tickets-accordion.component';
import { UserTicketsAccordionComponent } from '../../../tickets/components/user-tickets-accordion/user-tickets-accordion.component';
import { ModalTicketDetailComponent } from '../../../tickets/dialogs/modal-ticket-detail/modal-ticket-detail.component';
import { AccordionBranchMaintenanceMttoComponent } from '../maintenance/accordion-branch-maintenance-mtto/accordion-branch-maintenance-mtto.component';
import { IconosNotificacionesTicketsComponent } from '../../../tickets/components/iconos-notificaciones-tickets/iconos-notificaciones-tickets.component';
import { ModalPurshasesComponent } from '../../../compras/dialogs/modal-purshases/modal-purshases.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Ticket } from '../../../tickets/models/ticket.model';
import { EstatusTicket } from '../../../tickets/models/estatus-ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Compra } from '../../../compras/interfaces/compra.model';
import { TicketsService } from '../../../tickets/services/tickets.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { MaintenanceMtooService } from '../../services/maintenance-mtto.service';
import { PurchaseService } from '../../../compras/services/purchase.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { ModalRequestPurchaseComponent } from '../../../compras/dialogs/modal-request-purchase/modal-request-purchase.component';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { MantenimientoMtto } from '../../interfaces/mantenimiento-mtto.model';

@Component({
  selector: 'app-admin-maintenance-tab',
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
    ModalTicketDetailComponent,
    AccordionBranchMaintenanceMttoComponent,
    IconosNotificacionesTicketsComponent,
    ModalPurshasesComponent,
    ModalRequestPurchaseComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin-maintenance-tab.component.html',
  styleUrl: './admin-maintenance-tab.component.scss'
})

export class AdminMaintenanceTabComponent {
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
  mantenimientos: MantenimientoMtto[] = [];
  catStatusT: EstatusTicket[] = [];
  subscripcionTicket: Subscription | undefined;
  ticket: Ticket | undefined;
  usuario: Usuario;
  sucursal: Sucursal | undefined;
  usuariosHelp: Usuario[] = [];
  todosLostickets: Ticket[] = [];
  filterarea: any | undefined;
  usergroup: Usuario | undefined;
  idArea: string = '4';
  ordenarMantenimientosFecha: boolean = false;
  compras: Compra[] = [];
  auxMostrarMantenimientos = true;

  constructor(
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private ticketsService: TicketsService,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private maintenanceService: MaintenanceMtooService,
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
        sucursal.activoMantenimientos.includes('4')
      );
    }
    else {
      return this.sucursales.filter(sucursal =>
        Array.isArray(sucursal.activoMantenimientos) &&
        sucursal.activoMantenimientos.includes('4')
      );
    }
  }
}
