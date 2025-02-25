import {
  ChangeDetectorRef,
  Component,
  ViewChild,
  type OnInit,
} from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Sucursal } from '../../models/sucursal.model';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { StatusTicket } from '../../models/status-ticket.model';
import { TicketsService } from '../../services/tickets.service';
import { UsersService } from '../../services/users.service';
import { Usuario } from '../../models/usuario.model';
import { Ticket } from '../../models/ticket.model';
import { CategoriesService } from '../../services/categories.service';
import { StatusTicketService } from '../../services/status-ticket.service';
import { ModalFilterTicketsComponent } from '../../modals/tickets/modal-filter-tickets/modal-filter-tickets.component';
import { ModalGenerateTicketComponent } from '../../modals/tickets/modal-generate-ticket/modal-generate-ticket.component';
import { ModalTicketsHistoryComponent } from '../../modals/tickets/modal-tickets-history/modal-tickets-history.component';
import { AdminTicketsListComponent } from '../../components/tickets/admin-tickets-list/admin-tickets-list.component';
import { BranchesTicketsAccordionComponent } from '../../components/tickets/branches-tickets-accordion/branches-tickets-accordion.component';
import { UserTicketsAccordionComponent } from '../../components/tickets/user-tickets-accordion/user-tickets-accordion.component';

@Component({
  selector: 'app-home-a',
  standalone: true,
  imports: [
    ToastModule,
    CommonModule,
    ConfirmDialogModule,
    OverlayPanelModule,
    ModalFilterTicketsComponent,
    ModalGenerateTicketComponent,
    ModalTicketsHistoryComponent,
    AdminTicketsListComponent,
    BranchesTicketsAccordionComponent,
    UserTicketsAccordionComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './home-A.component.html',
})
export default class HomeAComponent implements OnInit {
  public showModalGenerateTicket: boolean = false;
  public formdepto: any;
  public formprov: any;
  public catcategorias: Sucursal[] = [];
  public catStatusT: StatusTicket[] = [];
  public arr_tickets: Ticket[] = [];
  public subscriptiontk: Subscription | undefined;
  public itemtk: Ticket | undefined;
  public userdata: any;
  public sucursal: Sucursal | undefined;
  public catusuarioshelp: Usuario[] = [];
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
    private ticketsService: TicketsService,
    private usersService: UsersService,
    private categoriesService: CategoriesService,
    private statusTicketService: StatusTicketService
  ) {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);

    this.getcatStatust();

    this.getusuarioshelp();
    this.getCategorias();
    this.getTicketsUser();
    this.sucursal = this.userdata.sucursales[0];
    this.formdepto = this.sucursal;
  }
  ngOnInit(): void {}

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
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

  getTicketsSuc(ids: number | any) {
    return this.arr_tickets.filter((x) => x.idSucursal == ids);
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

  agruparSucs() {
    this.usergroup = undefined;
    this.showagrupacion = true;
    this.cdr.detectChanges();
  }
}
