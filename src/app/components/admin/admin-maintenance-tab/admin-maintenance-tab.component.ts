import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ToastModule } from 'primeng/toast';
import { ModalFilterTicketsComponent } from '../../../modals/tickets/modal-filter-tickets/modal-filter-tickets.component';
import { ModalGenerateTicketComponent } from '../../../modals/tickets/modal-generate-ticket/modal-generate-ticket.component';
import { ModalTicketsHistoryComponent } from '../../../modals/tickets/modal-tickets-history/modal-tickets-history.component';
import { BranchesTicketsAccordionComponent } from '../../branch/branches-tickets-accordion/branches-tickets-accordion.component';
import { UserTicketsAccordionComponent } from '../user-tickets-accordion/user-tickets-accordion.component';
import { ModalTicketDetailComponent } from '../../../modals/tickets/modal-ticket-detail/modal-ticket-detail.component';
import { Ticket } from '../../../models/ticket.model';
import { Sucursal } from '../../../models/sucursal.model';
import { EstatusTicket } from '../../../models/estatus-ticket.model';
import { Subscription } from 'rxjs';
import { Usuario } from '../../../models/usuario.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TicketsService } from '../../../services/tickets.service';
import { UsersService } from '../../../services/users.service';
import { BranchesService } from '../../../services/branches.service';
import { Timestamp } from '@angular/fire/firestore';

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
    // AccordionBranchMaintenanceAvComponent
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
  sucursales: Sucursal[] = [];
  // mantenimientos: Mantenimiento6x6AV[] = [];
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
  auxMostrarMantenimientos = true;

  constructor(
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private ticketsService: TicketsService,
    private usersService: UsersService,
    private branchesService: BranchesService,
    // private maintenanceService: Maintenance6x6AvService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];

    this.obtenerTickets();
    this.obtenerUsuariosHelp();
    this.obtenerSucursales();
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
      },
      error: (error) => {
        console.error('Error al escuchar los tickets:', error);
      },
    });
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        // this.maintenanceService
        //   .getUltimos3Mantenimientos(
        //     this.sucursales.map((sucursal) => sucursal.id)
        //   )
        //   .subscribe((result) => {
        //     let data = result.filter((element) => element.length > 0);
        //     this.mantenimientos = [];
        //     for (let itemdata of data) {
        //       for (let item of itemdata) {
        //         this.mantenimientos.push(item);
        //       }
        //     }

        //     this.mantenimientos = this.mantenimientos.map(x => {
        //       x.fecha = this.getDate(x.fecha);
        //       return x;
        //     });
        //   });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
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

  obtenerUsuariosHelp() {
    this.usersService.get().subscribe({
      next: (data) => {
        this.usuariosHelp = data;
        this.usuariosHelp = this.usuariosHelp.filter((x) => x.idRol == '4' && x.idArea == this.idArea);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  agrupar(user: Usuario) {
    this.usergroup = user;
    this.mostrarAgrupacion = true;
  }

  agruparPorSucursal() {
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
