import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import Swal from 'sweetalert2';

import { ModalFilterTicketsComponent } from '../../../tickets/dialogs/modal-filter-tickets/modal-filter-tickets.component';
import { BranchesTicketsAccordionComponent } from '../../../tickets/components/branches-tickets-accordion/branches-tickets-accordion.component';
import { UserTicketsAccordionComponent } from '../../../tickets/components/user-tickets-accordion/user-tickets-accordion.component';
import { ModalTicketDetailComponent } from '../../../tickets/dialogs/modal-ticket-detail/modal-ticket-detail.component';
import { IconosNotificacionesTicketsComponent } from '../../../tickets/components/iconos-notificaciones-tickets/iconos-notificaciones-tickets.component';
import { ComprasDialogComponent } from '../../../compras/dialogs/compras-dialog/compras-dialog.component';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { EstatusTicket } from '../../../tickets/interfaces/estatus-ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Compra } from '../../../compras/interfaces/compra.model';
import { TicketsService } from '../../../tickets/services/tickets.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { MaintenanceAvService } from '../../../mantenimientos/services/maintenance-av.service';
import { MantenimientoAudioVideo } from '../../../mantenimientos/interfaces/mantenimiento-audio-video.interface';
import { MantenimientosSistemasService } from '../../../mantenimientos/services/mantenimientos-sistemas.service';
import { ComprasService } from '../../../compras/services/compras.service';
import { CrearTicketDialogComponent } from '../../dialogs/crear-ticket-dialog/crear-ticket-dialog.component';
import { SolicitarCompraDialogComponent } from '../../../compras/dialogs/solicitar-compra-dialog/solicitar-compra-dialog.component';
import { AcordeonMantenimientosSistemasComponent } from "../../../mantenimientos/components/acordeon-mantenimientos-sistemas/acordeon-mantenimientos-sistemas.component";
import { MantenimientoSys } from '../../../mantenimientos/interfaces/mantenimiento-sys.interface';
import { AcordeonMantenimientosAudioVideoComponent } from '../../../mantenimientos/components/acordeon-mantenimientos-audio-video/acordeon-mantenimientos-audio-video.component';
import { HistorialTicketsDialogComponent } from '../../dialogs/historial-tickets-dialog/historial-tickets-dialog.component';

@Component({
  selector: 'app-admin-audio-video-tab',
  standalone: true,
  imports: [
    ToastModule,
    CommonModule,
    FormsModule,
    ConfirmDialogModule,
    OverlayPanelModule,
    ModalFilterTicketsComponent,
    CrearTicketDialogComponent,
    HistorialTicketsDialogComponent,
    BranchesTicketsAccordionComponent,
    UserTicketsAccordionComponent,
    ModalTicketDetailComponent,
    IconosNotificacionesTicketsComponent,
    ComprasDialogComponent,
    SolicitarCompraDialogComponent,
    AcordeonMantenimientosAudioVideoComponent,
    AcordeonMantenimientosSistemasComponent
],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin-audio-video-tab.component.html',
  styleUrl: './admin-audio-video-tab.component.scss',
})

export class AdminAudioVideoTabComponent {
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
  mantenimientos: MantenimientoSys[] = [];
  catStatusT: EstatusTicket[] = [];
  subscripcionTicket: Subscription | undefined;
  ticket: Ticket | undefined;
  usuario: Usuario;
  sucursal: Sucursal | undefined;
  usuariosHelp: Usuario[] = [];
  todosLostickets: Ticket[] = [];
  filterarea: any | undefined;
  usergroup: Usuario | undefined;
  idArea: string = '2';
  ordenarMantenimientosFecha: boolean = false;
  compras: Compra[] = [];
  auxMostrarMantenimientos = true;
  mostrarMantenimientosAV: boolean = false;
  auxMostrarMantenimientosAV = true;
  mantenimientosAV: MantenimientoAudioVideo[] = [];

  constructor(
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private ticketsService: TicketsService,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private maintenanceService: MantenimientosSistemasService,
    private mantenimientosSistemasService: MantenimientosSistemasService,
    private maintenanceAvService: MaintenanceAvService,
    private purchaseService: ComprasService,
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
        // Ordenar por score global/urgencia (mayor a menor) y luego por fecha más reciente
        this.tickets.sort((a, b) => {
          const scoreA = a.scoreGlobal || (a as any).score || (((a as any).criticidad && (a as any).urgencia) ? (a as any).criticidad * (a as any).urgencia : 4);
          const scoreB = b.scoreGlobal || (b as any).score || (((b as any).criticidad && (b as any).urgencia) ? (b as any).criticidad * (b as any).urgencia : 4);
          if (scoreB !== scoreA) {
            return scoreB - scoreA;
          }
          const timeA = a.fecha?.toDate ? a.fecha.toDate().getTime() : (a.fecha ? new Date(a.fecha).getTime() : 0);
          const timeB = b.fecha?.toDate ? b.fecha.toDate().getTime() : (b.fecha ? new Date(b.fecha).getTime() : 0);
          return timeB - timeA;
        });
        this.todosLostickets = [...this.tickets];

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

        // TI
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

        // AV TI
        this.maintenanceAvService
          .getUltimosMantenimientos(
            this.sucursales.map((sucursal) => sucursal.id)
          )
          .subscribe((result) => {
            let data = result.filter((element) => element.length > 0);
            this.mantenimientosAV = [];
            for (let itemdata of data) {
              for (let item of itemdata) {
                this.mantenimientosAV.push(item);
              }
            }

            this.mantenimientosAV = this.mantenimientosAV.map(x => {
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
    this.usersService.getUsuariosPorRol(['4', '7'], this.idArea)
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
        sucursal.activoMantenimientos.includes('2')
      );
    }
    else {
      return this.sucursales.filter(sucursal =>
        Array.isArray(sucursal.activoMantenimientos) &&
        sucursal.activoMantenimientos.includes('2')
      );
    }

  }
}
