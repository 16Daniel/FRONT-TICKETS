import {
  ChangeDetectorRef,
  Component,
  ViewChild,
  type OnInit,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { Dialog, DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Sucursal } from '../../models/sucursal.model';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Proveedor } from '../../models/proveedor.model';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Notificacion } from '../../models/notificacion.model';
import HistorialTkComponent from '../../components/tickets/tickets-history/tickets-history.component';
import { AccordionModule } from 'primeng/accordion';
import { TicketDB } from '../../models/ticket-db.model';
import { TicketsService } from '../../services/tickets.service';
import { NotificationsService } from '../../services/notifications.service';
import { ModalGenerateTicketComponent } from '../../modals/tickets/modal-generate-ticket/modal-generate-ticket.component';
import { RequesterTicketsListComponent } from '../../components/tickets/requester-tickets-list/requester-tickets-list.component';
import { ModalTicketDetailComponent } from '../../modals/tickets/modal-ticket-detail/modal-ticket-detail.component';
import { ModalFinalizeTicketComponent } from '../../modals/tickets/modal-finalize-ticket/modal-finalize-ticket.component';
import { ModalFilterTicketsComponent } from '../../modals/tickets/modal-filter-tickets/modal-filter-tickets.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TableModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    EditorModule,
    ToastModule,
    CommonModule,
    TagModule,
    ConfirmDialogModule,
    OverlayPanelModule,
    HistorialTkComponent,
    AccordionModule,
    ModalGenerateTicketComponent,
    RequesterTicketsListComponent,
    ModalTicketDetailComponent,
    ModalFinalizeTicketComponent,
    ModalFilterTicketsComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './home.component.html',
})
export default class HomeComponent implements OnInit {
  showModalGenerateTicket: boolean = false;
  public formdepto: any;
  public catproveedores: Proveedor[] = [];
  public arr_tickets: TicketDB[] = []; //aqui
  public subscriptiontk: Subscription | undefined;
  public showModalTicketDetail: boolean = false; //aqui
  public modalcomentarios: boolean = false;
  public modaladdcomentario: boolean = false;
  public itemtk: TicketDB | undefined; //aqui
  public formcomentario: string = '';
  public userdata: any;
  public sucursal: Sucursal | undefined;
  public selectedtk: TicketDB | undefined; //aqui
  public all_arr_tickets: TicketDB[] = [];
  public showModalFinalizeTicket: boolean = false;
  public modalhistorial: boolean = false;
  public formstatus: any;
  public loading: boolean = false;

  @ViewChild('dialogHtk') dialog!: Dialog;

  constructor(
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private ticketsService: TicketsService,
    private notificationsService: NotificationsService,
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

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  async getTicketsUser(userid: string): Promise<void> {
    this.loading = true;
    this.subscriptiontk = this.ticketsService
      .getRealTimeTicketsByUserId(userid)
      .subscribe({
        next: (data) => {
          console.log(data);
          this.arr_tickets = data;
          let arr_temp: TicketDB[] = [];
          let temp1: TicketDB[] = this.arr_tickets.filter(
            (x) => x.prioridadsuc == 'PÁNICO'
          );
          let temp2: TicketDB[] = this.arr_tickets.filter(
            (x) => x.prioridadsuc == 'ALTA'
          );
          let temp3: TicketDB[] = this.arr_tickets.filter(
            (x) => x.prioridadsuc == 'MEDIA'
          );
          let temp4: TicketDB[] = this.arr_tickets.filter(
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
          this.all_arr_tickets = [...arr_temp];
          this.arr_tickets = arr_temp;

          if (this.itemtk != undefined) {
            let temp = this.arr_tickets.filter((x) => x.id == this.itemtk!.id);
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
          this.arr_tickets = data;
          let arr_temp: TicketDB[] = [];
          let temp1: TicketDB[] = this.arr_tickets.filter(
            (x) => x.prioridadsuc == 'PÁNICO'
          );
          let temp2: TicketDB[] = this.arr_tickets.filter(
            (x) => x.prioridadsuc == 'ALTA'
          );
          let temp3: TicketDB[] = this.arr_tickets.filter(
            (x) => x.prioridadsuc == 'MEDIA'
          );
          let temp4: TicketDB[] = this.arr_tickets.filter(
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
          this.all_arr_tickets = [...arr_temp];
          this.arr_tickets = arr_temp;

          if (this.itemtk != undefined) {
            let temp = this.arr_tickets.filter((x) => x.id == this.itemtk!.id);
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

  ngOnDestroy() {
    if (this.subscriptiontk != undefined) {
      this.subscriptiontk.unsubscribe();
    }
  }

  getBgPrioridad(value: string): string {
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

  abrirModalDetalleTicket(ticket: any) {
    this.itemtk = ticket;
    this.showModalTicketDetail = true;

    setTimeout(() => {
      var accordionItems = document.querySelectorAll('.accordion-collapse');
      accordionItems.forEach(function (item) {
        item.classList.remove('show'); // Cierra todas las secciones del accordion
      });
    }, 50);
  }

  addComentariotk() {
    let idu = this.userdata.uid;

    let data = {
      nombre: this.userdata.nombre + ' ' + this.userdata.apellidoP,
      uid: idu,
      comentario: this.formcomentario,
      fecha: new Date(),
    };
    this.itemtk!.comentarios.push(data);

    this.ticketsService
      .updateTicket(this.itemtk)
      .then(() => {
        this.showMessage('success', 'Success', 'Enviado correctamente');

        let dataNot: Notificacion = {
          titulo: 'NUEVO COMENTARIO',
          mensaje: 'HAY UN NUEVO COMENTARIO PARA EL TICKET: ' + this.itemtk!.id,
          uid: 'jBWVcuCQlRh3EKgSkWCz6JMYA9C2',
          fecha: new Date(),
          abierta: false,
          idtk: this.itemtk!.id,
          notificado: false,
        };

        let idn = this.notificationsService.addNotifiacion(dataNot);

        this.formcomentario = '';
        this.modaladdcomentario = false;
      })
      .catch((error) =>
        console.error('Error al actualizar los comentarios:', error)
      );
  }

  esmiuid(id: string): boolean {
    let st = false;
    let userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    let idu = this.userdata.uid;
    if (id == idu) {
      st = true;
    }
    return st;
  }

  getNameProveedor(idp: string): string {
    let str = '';
    let temp = this.catproveedores.filter((x) => x.id == idp);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

  showModalFiltros() {
    this.showModalFinalizeTicket = true;
  }

  showHistorial() {
    this.modalhistorial = true;
    this.dialog.maximized = true;
  }

  getTicketsSuc(ids: string) {
    return this.arr_tickets.filter((x) => x.idsucordpto == ids);
  }
}
