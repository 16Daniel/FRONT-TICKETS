import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { ModalFilterTicketsComponent } from '../../../tickets/dialogs/modal-filter-tickets/modal-filter-tickets.component';
import { BranchesTicketsAccordionComponent } from '../../../tickets/components/branches-tickets-accordion/branches-tickets-accordion.component';
import { UserTicketsAccordionComponent } from '../../../tickets/components/user-tickets-accordion/user-tickets-accordion.component';
import { ModalTicketDetailComponent } from '../../../tickets/dialogs/modal-ticket-detail/modal-ticket-detail.component';
import { IconosNotificacionesTicketsComponent } from '../../../tickets/components/iconos-notificaciones-tickets/iconos-notificaciones-tickets.component';
import { ComprasDialogComponent } from '../../../compras/dialogs/compras-dialog/compras-dialog.component';
import { CrearTicketDialogComponent } from '../../dialogs/crear-ticket-dialog/crear-ticket-dialog.component';
import { SolicitarCompraDialogComponent } from '../../../compras/dialogs/solicitar-compra-dialog/solicitar-compra-dialog.component';
import { HistorialTicketsDialogComponent } from '../../dialogs/historial-tickets-dialog/historial-tickets-dialog.component';

import { AcordeonMantenimientosSistemasComponent } from '../../../mantenimientos/components/acordeon-mantenimientos-sistemas/acordeon-mantenimientos-sistemas.component';
import { AcordeonMantenimientosAudioVideoComponent } from '../../../mantenimientos/components/acordeon-mantenimientos-audio-video/acordeon-mantenimientos-audio-video.component';
import { AcordeonMantenimientosMantenimientoComponent } from '../../../mantenimientos/components/acordeon-mantenimientos-mantenimiento/acordeon-mantenimientos-mantenimiento.component';

import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { EstatusTicket } from '../../../tickets/interfaces/estatus-ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Compra } from '../../../compras/interfaces/compra.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { MantenimientoSys } from '../../../mantenimientos/interfaces/mantenimiento-sys.interface';
import { MantenimientoAudioVideo } from '../../../mantenimientos/interfaces/mantenimiento-audio-video.interface';
import { MantenimientoMtto } from '../../../mantenimientos/interfaces/mantenimiento-mtto.interface';

import { TicketsService } from '../../../tickets/services/tickets.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { ComprasService } from '../../../compras/services/compras.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { MantenimientosSistemasService } from '../../../mantenimientos/services/mantenimientos-sistemas.service';
import { MaintenanceAvService } from '../../../mantenimientos/services/maintenance-av.service';
import { MaintenanceMtooService } from '../../../mantenimientos/services/maintenance-mtto.service';

@Component({
  selector: 'app-admin-area-tab',
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
    AcordeonMantenimientosSistemasComponent,
    AcordeonMantenimientosAudioVideoComponent,
    AcordeonMantenimientosMantenimientoComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin-area-tab.component.html',
  styleUrl: './admin-area-tab.component.scss'
})
export class AdminAreaTabComponent implements OnInit, OnDestroy {
  @Input() idArea!: string;
  @Input() areaName!: string;

  tickets: Ticket[] = [];
  todosLostickets: Ticket[] = [];
  ticket: Ticket | undefined;
  
  sucursales: Sucursal[] = [];
  usuariosHelp: Usuario[] = [];
  compras: Compra[] = [];
  
  mantenimientosTI: MantenimientoSys[] = [];
  mantenimientosAV: MantenimientoAudioVideo[] = [];
  mantenimientosMtto: MantenimientoMtto[] = [];

  mostrarModalGenerateTicket: boolean = false;
  mostrarModalFilterTickets: boolean = false;
  mostrarModalHistorial: boolean = false;
  mostrarAgrupacion: boolean = false;
  mostrarModalTicketDetail: boolean = false;
  mostrarModalCompras: boolean = false;
  mostrarModalSolicitarCompra: boolean = false;

  mostrarMantenimientosTI = false;
  mostrarMantenimientosAV = false;
  mostrarMantenimientosMtto = false;
  
  auxMostrarMantenimientos = true;
  ordenarMantenimientosFecha: boolean = false;

  usuario: Usuario;
  sucursal: Sucursal | undefined;
  usergroup: Usuario | undefined;

  subscripcionTicket: Subscription | undefined;

  constructor(
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private ticketsService: TicketsService,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private purchaseService: ComprasService,
    private datesHelper: DatesHelperService,
    private maintenanceSysService: MantenimientosSistemasService,
    private maintenanceAvService: MaintenanceAvService,
    private maintenanceMttoService: MaintenanceMtooService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];
  }

  ngOnInit() {
    this.obtenerTickets();
    this.obtenerUsuariosHelp();
    this.obtenerSucursales();
    this.obtenerCompras();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // Trigger animations / re-renders if needed
      this.auxMostrarMantenimientos = false;
      this.cdr.detectChanges();
      this.auxMostrarMantenimientos = true;
      this.cdr.detectChanges();
    }, 1500);
  }

  ngOnDestroy() {
    if (this.subscripcionTicket) {
      this.subscripcionTicket.unsubscribe();
    }
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
      customClass: { container: 'swal-topmost' }
    });

    this.subscripcionTicket = this.ticketsService.getByArea(this.idArea).subscribe({
      next: (data) => {
        this.tickets = data;
        this.tickets.sort((a, b) => {
          const scoreA = (a as any).score || (((a as any).criticidad && (a as any).urgencia) ? (a as any).criticidad * (a as any).urgencia : 4);
          const scoreB = (b as any).score || (((b as any).criticidad && (b as any).urgencia) ? (b as any).criticidad * (b as any).urgencia : 4);
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
        
        // Convert to string for category consistency
        this.tickets = this.tickets.map((item: any) => ({
          ...item,
          idCategoria: item.idCategoria ? item.idCategoria.toString() : item.idCategoria
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

        if (this.idArea === '1' || this.idArea === '2') {
          // TI
          this.maintenanceSysService.getUltimosMantenimientos(this.sucursales.map(s => s.id)).subscribe((result) => {
            let filtered = result.filter(e => e.length > 0);
            this.mantenimientosTI = [];
            for (let itemdata of filtered) {
              for (let item of itemdata) this.mantenimientosTI.push(item);
            }
            this.mantenimientosTI = this.mantenimientosTI.map(x => { x.fecha = this.datesHelper.getDate(x.fecha); return x; });
            this.cdr.detectChanges();
          });

          // AV
          this.maintenanceAvService.getUltimosMantenimientos(this.sucursales.map(s => s.id)).subscribe((result) => {
            let filtered = result.filter(e => e.length > 0);
            this.mantenimientosAV = [];
            for (let itemdata of filtered) {
              for (let item of itemdata) this.mantenimientosAV.push(item);
            }
            this.mantenimientosAV = this.mantenimientosAV.map(x => { x.fecha = this.datesHelper.getDate(x.fecha); return x; });
            this.cdr.detectChanges();
          });
        }

        if (this.idArea === '4') {
          // Mtto
          this.maintenanceMttoService.getUltimosMantenimientos(this.sucursales.map(s => s.id)).subscribe((result) => {
            let filtered = result.filter(e => e.length > 0);
            this.mantenimientosMtto = [];
            for (let itemdata of filtered) {
              for (let item of itemdata) this.mantenimientosMtto.push(item);
            }
            this.mantenimientosMtto = this.mantenimientosMtto.map(x => { x.fecha = this.datesHelper.getDate(x.fecha); return x; });
            this.cdr.detectChanges();
          });
        }

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
      this.tickets = this.tickets.filter(x => x.idUsuarioEspecialista == this.usergroup!.id);
    } else {
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

  sucursalesMantenimeintosActivos(areaIdToCheck: string) {
    if (this.usergroup !== undefined) {
      const idsSucursalesUsuario = this.usergroup?.sucursales.map(s => String(s.id));
      return this.sucursales.filter(sucursal =>
        idsSucursalesUsuario?.includes(String(sucursal.id)) &&
        Array.isArray(sucursal.activoMantenimientos) &&
        sucursal.activoMantenimientos.includes(areaIdToCheck)
      );
    } else {
      return this.sucursales.filter(sucursal =>
        Array.isArray(sucursal.activoMantenimientos) &&
        sucursal.activoMantenimientos.includes(areaIdToCheck)
      );
    }
  }
}
