import { ChangeDetectorRef, Component, input, Input, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Subscription, timeInterval } from 'rxjs';
import { Sucursal } from '../../../models/sucursal.model';
import { EstatusTicket } from '../../../models/estatus-ticket.model';
import { TicketsService } from '../../../services/tickets.service';
import { UsersService } from '../../../services/users.service';
import { Usuario } from '../../../models/usuario.model';
import { Ticket } from '../../../models/ticket.model';
import { ModalFilterTicketsComponent } from '../../../modals/tickets/modal-filter-tickets/modal-filter-tickets.component';
import { ModalGenerateTicketComponent } from '../../../modals/tickets/modal-generate-ticket/modal-generate-ticket.component';
import { ModalTicketsHistoryComponent } from '../../../modals/tickets/modal-tickets-history/modal-tickets-history.component';
import { BranchesTicketsAccordionComponent } from '../../../components/tickets/branches-tickets-accordion/branches-tickets-accordion.component';
import { UserTicketsAccordionComponent } from '../../../components/tickets/user-tickets-accordion/user-tickets-accordion.component';
import { BranchesService } from '../../../services/branches.service';
import { Maintenance10x10Service } from '../../../services/maintenance-10x10.service';
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { AccordionBranchMaintenance10x10Component } from '../../../components/maintenance/systems/accordion-branch-maintenance10x10/accordion-branch-maintenance10x10.component';
import { ModalTicketDetailComponent } from "../../../modals/tickets/modal-ticket-detail/modal-ticket-detail.component";

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
  ],
    providers: [MessageService, ConfirmationService],
  templateUrl: './admin-sys-tab.component.html',
  styleUrl: './admin-sys-tab.component.scss',
})
export class AdminSysTabComponent {
  tickets: Ticket[] = [];
  mostrarModalGenerateTicket: boolean = false;
  mostrarMantenimientos: boolean = false;
  mostrarModalFilterTickets: boolean = false;
  mostrarModalHistorial: boolean = false;
  mostrarAgrupacion: boolean = false;
  mostrarModalTicketDetail: boolean = false;
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
  IdArea:string = '1';  

  constructor(
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private ticketsService: TicketsService,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private maintenanceService: Maintenance10x10Service
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
    this.subscripcionTicket = this.ticketsService.getByArea(this.IdArea).subscribe({
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

        this.tickets = this.tickets.filter(x=> x.validacionAdmin != true); 
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
        this.maintenanceService
          .getUltimos3Mantenimientos(
            this.sucursales.map((sucursal) => sucursal.id)
          )
          .subscribe((result) => {
            let data =  result.filter((element) => element.length>0);
            this.mantenimientos = [];
            for(let itemdata of data)
              {
                for(let item of itemdata)
                  {
                    this.mantenimientos.push(item); 
                  }
              }
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
    this.usersService.get().subscribe({
      next: (data) => {
        this.usuariosHelp = data;
        this.usuariosHelp = this.usuariosHelp.filter((x) => x.idRol == '4' && x.idArea == this.IdArea);
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

}
