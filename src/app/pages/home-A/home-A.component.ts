import {
  ChangeDetectorRef,
  Component,
  ViewChild,
  type OnInit,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Sucursal } from '../../models/sucursal.model';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { StatusTicket } from '../../models/status-ticket.model';
import { FolioGeneratorService } from '../../services/folio-generator.service';
import { TicketsService } from '../../services/tickets.service';
import { UsersService } from '../../services/users.service';
import { NotificationsService } from '../../services/notifications.service';
import { Usuario } from '../../models/usuario.model';
import { Notificacion } from '../../models/notificacion.model';
import { Ticket } from '../../models/ticket.model';
import { BranchesService } from '../../services/branches.service';
import { CategoriesService } from '../../services/categories.service';
import { AreasService } from '../../services/areas.service';
import { StatusTicketService } from '../../services/status-ticket.service';
import { Area } from '../../models/area';
import { ModalFilterTicketsComponent } from '../../modals/tickets/modal-filter-tickets/modal-filter-tickets.component';
import { ModalGenerateTicketComponent } from '../../modals/tickets/modal-generate-ticket/modal-generate-ticket.component';
import { ModalTicketsHistoryComponent } from '../../modals/tickets/modal-tickets-history/modal-tickets-history.component';
import { AdminTicketsListComponent } from '../../components/tickets/admin-tickets-list/admin-tickets-list.component';

@Component({
  selector: 'app-home-a',
  standalone: true,
  imports: [
    TableModule,
    DropdownModule,
    FormsModule,
    ToastModule,
    CommonModule,
    ConfirmDialogModule,
    OverlayPanelModule,
    AccordionModule,
    BadgeModule,
    ModalFilterTicketsComponent,
    ModalGenerateTicketComponent,
    ModalTicketsHistoryComponent,
    AdminTicketsListComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './home-A.component.html',
})
export default class HomeAComponent implements OnInit {
  public showModalGenerateTicket: boolean = false;
  public formdepto: any;
  public formprov: any;
  public formcategoria: any;
  public formnomsolicitante: any;
  public formdescripcion: string = '';
  public formprioridad: any;
  public formstatussuc: any;
  public catsucursales: Sucursal[] = [];
  public areas: Area[] = [];
  public catcategorias: Sucursal[] = [];
  public catStatusT: StatusTicket[] = [];
  public arr_tickets: Ticket[] = [];
  public subscriptiontk: Subscription | undefined;
  public modalticket: boolean = false;
  public itemtk: Ticket | undefined;
  public userdata: any;
  public sucursal: Sucursal | undefined;
  public catusuarioshelp: Usuario[] = [];
  public selectedtk: Ticket | undefined;
  public all_arr_tickets: Ticket[] = [];
  public showModalFilterTickets: boolean = false;
  public filterarea: any | undefined;
  public showModalHistorial: boolean = false;

  public showagrupacion: boolean = false;
  public usergroup: Usuario | undefined;

  @ViewChild('dialogHtk') dialog!: Dialog;

  constructor(
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private folioGeneratorService: FolioGeneratorService,
    private ticketsService: TicketsService,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
    private branchesService: BranchesService,
    private categoriesService: CategoriesService,
    private areasService: AreasService,
    private statusTicketService: StatusTicketService
  ) {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);

    this.getcatStatust();
    this.getDepartamentos();
    this.getProveedores();
    this.getusuarioshelp();
    this.getCategorias();
    this.getTicketsUser();
    this.sucursal = this.userdata.sucursales[0];
    this.formdepto = this.sucursal;
  }
  ngOnInit(): void {}

  openadd() {
    this.showModalGenerateTicket = true;
  }

  async enviartk(): Promise<void> {
    this.ticketsService.obtenerSecuencialTickets().then(async (count) => {
      let folio = this.folioGeneratorService.generarFolio(
        this.formdepto.id,
        count
      );

      console.log('Folio:', folio);

      let idu = this.userdata.uid;
      let comtk: any[] = [];
      let tk: Ticket = {
        fecha: new Date(),
        idSucursal: this.formdepto.id,
        estatusSucursal: null,
        idProveedor: this.formprov.id,
        idCategoria: this.formcategoria.id,
        decripcion: this.formdescripcion,
        solicitante: this.formnomsolicitante,
        prioridadSucursal: this.formprioridad.name,
        prioridadProveedor: null,
        estatus: 1,
        responsable: this.getResponsabletk(),
        comentarios: comtk,
        fechaFin: null,
        // duracion: null,
        fechaEstimacion: null,
        tipoSoporte: null,
        idUsuario: idu,
        nombreCategoria: this.formcategoria.nombre,
        folio,
        calificacion: 0,
        participantesChat: []
      };
      debugger;
      const docid = await this.ticketsService.create(tk);
      this.showMessage('success', 'Success', 'ENVIADO CORRECTAMENTE');

      let dataNot: Notificacion = {
        titulo: 'NUEVO TICKET',
        mensaje:
          'SE GENERÓ UN NUEVO TICKET PARA LA SUCURSAL: ' +
          this.formdepto.nombre,
        uid: 'jBWVcuCQlRh3EKgSkWCz6JMYA9C2',
        fecha: new Date(),
        abierta: false,
        idTicket: docid,
        notificado: false,
      };

      let idn = this.notificationsService.addNotifiacion(dataNot);

      this.showModalGenerateTicket = false;
      this.formdescripcion = '';
      this.formnomsolicitante = '';
      this.formcategoria = undefined;
      this.formstatussuc = undefined;
      this.formprov = undefined;
      this.formprioridad = undefined;
    });
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  getDepartamentos() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.catsucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  getProveedores() {
    this.areasService.get().subscribe({
      next: (data) => {
        this.areas = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  getcatStatust() {
    this.statusTicketService.get().subscribe({
      next: (data) => {
        this.catStatusT = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  getCategorias() {
    this.categoriesService.get().subscribe({
      next: (data) => {
        this.catcategorias = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  changeprov() {
    if (this.formprov != undefined) {
      this.categoriesService.getCategoriasprov(this.formprov.id).subscribe({
        next: (data) => {
          this.catcategorias = data;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.log(error);
          this.showMessage('error', 'Error', 'Error al procesar la solicitud');
        },
      });
    }
  }

  changeprovFilter() {
    if (this.filterarea != undefined) {
      this.categoriesService.getCategoriasprov(this.filterarea.id).subscribe({
        next: (data) => {
          this.catcategorias = data;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.log(error);
          this.showMessage('error', 'Error', 'Error al procesar la solicitud');
        },
      });
    }
  }

  async getTicketsUser(): Promise<void> {
    this.subscriptiontk = this.ticketsService.get().subscribe({
      next: (data) => {
        this.arr_tickets = data;
        let arr_temp: Ticket[] = [];
        let temp1: Ticket[] = this.arr_tickets.filter(
          (x) => x.prioridadSucursal == 'PÁNICO'
        );
        let temp2: Ticket[] = this.arr_tickets.filter(
          (x) => x.prioridadSucursal == 'ALTA'
        );
        let temp3: Ticket[] = this.arr_tickets.filter(
          (x) => x.prioridadSucursal == 'MEDIA'
        );
        let temp4: Ticket[] = this.arr_tickets.filter(
          (x) => x.prioridadSucursal == 'BAJA'
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

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al escuchar los tickets:', error);
      },
    });
  }

  ngOnDestroy() {
    if (this.subscriptiontk != undefined) {
      this.subscriptiontk.unsubscribe();
    }
  }

  getdate(tsmp: Timestamp): Date {
    // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
    const firestoreTimestamp = tsmp; // Ejemplo
    const date = firestoreTimestamp.toDate(); // Convierte a Date
    return date;
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

  showticketA(item: any) {
    this.itemtk = item;
    this.modalticket = true;
  }

  updatestatusSuc(idt: string) {
    let temp = this.arr_tickets.filter((x) => x.id == idt);
    if (temp.length > 0) {
      let ticket = temp[0];
      ticket.estatusSucursal = 'PÁNICO';
      ticket.prioridadSucursal = 'PÁNICO';

      this.ticketsService
        .update(ticket)
        .then(() => {
          this.showMessage('success', 'Success', 'Enviado correctamente');
        })
        .catch((error) =>
          console.error('Error al actualizar los comentarios:', error)
        );
    }
  }

  getusuarioshelp() {
    this.usersService.getusers().subscribe({
      next: (data) => {
        this.catusuarioshelp = data;
        this.catusuarioshelp = this.catusuarioshelp.filter(
          (x) => x.idRol == '4'
        );
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  getResponsabletk(): string {
    let idr = '';
    for (let item of this.catusuarioshelp) {
      const existeSucursal = item.sucursales.some(
        (sucursal) => sucursal.id == sucursal.id
      );
      if (existeSucursal) {
        idr = item.uid;
      }
    }

    return idr;
  }

  showModalFiltros() {
    this.showModalFilterTickets = true;
  }

  showHistorial() {
    this.showModalHistorial = true;
    this.dialog.maximized = true;
  }

  getTicketsSuc(ids: number | any) {
    return this.arr_tickets.filter((x) => x.idSucursal == ids);
  }

  getNameSuc(ids: string): string {
    let str = '';
    let temp = this.catsucursales.filter((x) => x.id == ids);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

  getNameResponsable(id: string): string {
    let name = '';

    let temp = this.catusuarioshelp.filter((x) => x.uid == id);
    if (temp.length > 0) {
      name = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return name;
  }

  agrupar(user: Usuario) {
    this.usergroup = user;
    this.showagrupacion = true;
  }

  showalltk() {
    this.usergroup = undefined;
    this.showagrupacion = false;
    this.cdr.detectChanges();
  }

  getBGSuc(value: number): string {
    let str = '';

    if (value >= 5) {
      str = '#ff0000';
    }

    if (value > 0 && value <= 4) {
      str = '#ffe800';
    }

    if (value == 0) {
      str = '#00a312';
    }

    return str;
  }

  getColortxt(value: number): string {
    let str = '';

    if (value >= 5) {
      str = '#fff';
    }

    if (value > 0 && value <= 4) {
      str = '#000';
    }

    if (value == 0) {
      str = '#fff';
    }

    return str;
  }

  updatetk(tk: Ticket) {
    this.ticketsService
      .update(tk)
      .then(() => {})
      .catch((error) => console.error(error));
  }

  agruparSucs() {
    this.usergroup = undefined;
    this.showagrupacion = true;
    this.cdr.detectChanges();
  }

  getResponsablesUC(ids: string): string {
    let idr = '';
    for (let item of this.catusuarioshelp) {
      const existeSucursal = item.sucursales.some(
        (sucursal) => sucursal.id == ids
      );
      if (existeSucursal) {
        idr = item.nombre + ' ' + item.apellidoP;
      }
    }

    return idr;
  }

  ordenarSucursales(): Sucursal[] {
    return this.catsucursales.sort((a, b) => {
      const ticketsA = this.getTicketsSuc(a.id).length;
      const ticketsB = this.getTicketsSuc(b.id).length;
      return ticketsB - ticketsA; // Ordena de mayor a menor
    });
  }

  ordenarSucursalesUser(catsucursales: Sucursal[]): Sucursal[] {
    return catsucursales.sort((a, b) => {
      const ticketsA = this.getTicketsSuc(a.id).length;
      const ticketsB = this.getTicketsSuc(b.id).length;
      return ticketsB - ticketsA; // Ordena de mayor a menor
    });
  }
}
