import {
  ChangeDetectorRef,
  Component,
  ViewChild,
  type OnInit,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { Dialog, DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Sucursal } from '../../models/sucursal.model';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Proveedor } from '../../models/proveedor.model';
import HistorialTkComponent from '../../components/tickets/tickets-history/tickets-history.component';
import { TicketDB } from '../../models/ticket-db.model';
import { TicketsService } from '../../services/tickets.service';
import { ModalGenerateTicketComponent } from '../../modals/tickets/modal-generate-ticket/modal-generate-ticket.component';
import { RequesterTicketsListComponent } from '../../components/tickets/requester-tickets-list/requester-tickets-list.component';
import { ModalTicketDetailComponent } from '../../modals/tickets/modal-ticket-detail/modal-ticket-detail.component';
import { ModalFinalizeTicketComponent } from '../../modals/tickets/modal-finalize-ticket/modal-finalize-ticket.component';
import { ModalFilterTicketsComponent } from '../../modals/tickets/modal-filter-tickets/modal-filter-tickets.component';
import { ModalTicketsHistoryComponent } from '../../modals/tickets/modal-tickets-history/modal-tickets-history.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TableModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    HistorialTkComponent,
    ModalGenerateTicketComponent,
    RequesterTicketsListComponent,
    ModalTicketDetailComponent,
    ModalFinalizeTicketComponent,
    ModalFilterTicketsComponent,
    ModalTicketsHistoryComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './home.component.html',
})
export default class HomeComponent implements OnInit {
  @ViewChild('dialogHtk') dialog!: Dialog;

  showModalGenerateTicket: boolean = false;
  showModalFinalizeTicket: boolean = false;
  showModalTicketDetail: boolean = false;
  showModalHistorial: boolean = false;

  sucursal: Sucursal | undefined;
  tickets: TicketDB[] = [];
  todosLosTickets: TicketDB[] = [];

  formdepto: any;
  catproveedores: Proveedor[] = [];
  subscriptiontk: Subscription | undefined;
  itemtk: TicketDB | undefined;
  userdata: any;
  selectedtk: TicketDB | undefined;
  loading: boolean = false;

  constructor(
    public cdr: ChangeDetectorRef,
    private ticketsService: TicketsService
  ) {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    let idu = this.userdata.uid;

    if (this.userdata.idRol == '2') {
      this.getTicketsUser(idu);
    }

    if (this.userdata.idRol == '4') {
      this.getTicketsResponsable(idu);
    }
    this.sucursal = this.userdata.sucursales[0];
    this.formdepto = this.sucursal;
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    if (this.subscriptiontk != undefined) {
      this.subscriptiontk.unsubscribe();
    }
  }

  async getTicketsUser(userid: string): Promise<void> {
    this.loading = true;
    this.subscriptiontk = this.ticketsService
      .getRealTimeTicketsByUserId(userid)
      .subscribe({
        next: (data) => {
          console.log(data);
          this.tickets = data;
          let arr_temp: TicketDB[] = [];
          let temp1: TicketDB[] = this.tickets.filter(
            (x) => x.prioridadsuc == 'PÁNICO'
          );
          let temp2: TicketDB[] = this.tickets.filter(
            (x) => x.prioridadsuc == 'ALTA'
          );
          let temp3: TicketDB[] = this.tickets.filter(
            (x) => x.prioridadsuc == 'MEDIA'
          );
          let temp4: TicketDB[] = this.tickets.filter(
            (x) => x.prioridadsuc == 'BAJA'
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

          if (this.itemtk != undefined) {
            let temp = this.tickets.filter((x) => x.id == this.itemtk!.id);
            if (temp.length > 0) {
              this.itemtk = temp[0];
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

  async getTicketsResponsable(userid: string): Promise<void> {
    this.loading = true;
    this.subscriptiontk = this.ticketsService
      .getTicketsResponsable(userid)
      .subscribe({
        next: (data) => {
          this.tickets = data;
          let arr_temp: TicketDB[] = [];
          let temp1: TicketDB[] = this.tickets.filter(
            (x) => x.prioridadsuc == 'PÁNICO'
          );
          let temp2: TicketDB[] = this.tickets.filter(
            (x) => x.prioridadsuc == 'ALTA'
          );
          let temp3: TicketDB[] = this.tickets.filter(
            (x) => x.prioridadsuc == 'MEDIA'
          );
          let temp4: TicketDB[] = this.tickets.filter(
            (x) => x.prioridadsuc == 'BAJA'
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

          if (this.itemtk != undefined) {
            let temp = this.tickets.filter((x) => x.id == this.itemtk!.id);
            if (temp.length > 0) {
              this.itemtk = temp[0];
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

  abrirModalDetalleTicket(ticket: TicketDB | any) {
    this.itemtk = ticket;
    this.showModalTicketDetail = true;

    setTimeout(() => {
      var accordionItems = document.querySelectorAll('.accordion-collapse');
      accordionItems.forEach(function (item) {
        item.classList.remove('show'); // Cierra todas las secciones del accordion
      });
    }, 50);
  }

  obtenerNombreProveedor(idp: string): string {
    let nombre = '';
    let proveedor = this.catproveedores.filter((x) => x.id == idp);
    if (proveedor.length > 0) {
      nombre = proveedor[0].nombre;
    }
    return nombre;
  }

  // showHistorial() {
  //   this.modalhistorial = true;
  //   this.dialog.maximized = true;
  // }

  obtenerTicketsPorSucursal(idSucursal: string) {
    return this.tickets.filter((x) => x.idsucordpto == idSucursal);
  }
}
