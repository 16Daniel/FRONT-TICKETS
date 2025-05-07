import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Timestamp } from '@firebase/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmationService, MessageService } from 'primeng/api';

import { Ticket } from '../../../models/ticket.model';
import { TicketsService } from '../../../services/tickets.service';
import { Usuario } from '../../../models/usuario.model';
import { Sucursal } from '../../../models/sucursal.model';
import { Area } from '../../../models/area';
import { UsersService } from '../../../services/users.service';
import { BranchesService } from '../../../services/branches.service';
import { AreasService } from '../../../services/areas.service';
import { Categoria } from '../../../models/categoria.mdoel';
import { CategoriesService } from '../../../services/categories.service';
import { SupportTypesService } from '../../../services/support-types.service';
import { TipoSoporte } from '../../../models/tipo-soporte.model';
import { TicketsPriorityService } from '../../../services/tickets-priority.service';
import { PrioridadTicket } from '../../../models/prioridad-ticket.model';
import { StatusTicketService } from '../../../services/status-ticket.service';
import { EstatusTicket } from '../../../models/estatus-ticket.model';
import { ModalFinalizeTicketComponent } from "../../../modals/tickets/modal-finalize-ticket/modal-finalize-ticket.component";
import { ModalValidateTicketComponent } from "../../../modals/tickets/modal-validate-ticket/modal-validate-ticket.component";
import { ModalTicketChatComponent } from "../../../modals/tickets/modal-ticket-chat/modal-ticket-chat.component";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ModalTicketDetailComponent } from "../../../modals/tickets/modal-ticket-detail/modal-ticket-detail.component";
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';


@Component({
  selector: 'app-admin-tickets-list',
  standalone: true,
  imports: [
    DropdownModule,
    CommonModule,
    FormsModule,
    TableModule,
    BadgeModule,
    AccordionModule,
    ModalValidateTicketComponent,
    ModalTicketChatComponent,
    ConfirmDialogModule,
    ModalTicketDetailComponent,
    TooltipModule,
    CalendarModule
],
  templateUrl: './admin-tickets-list.component.html',
  styleUrl: './admin-tickets-list.component.scss',
})

export class AdminTicketsListComponent {
  @Input() tickets: Ticket[] = [];
  @Input() mostrarAcciones: boolean = true;
  @Input() mostrarAccionChat: boolean = true;
  @Input() mostrarAccionFinalizar: boolean = true;
  @Input() mostrarEstrellas: boolean = true;
  @Input() mostrarFedchaEstimacion: boolean = true;
  @Input() mostrarAccionValidar: boolean = true;
  sucursales: Sucursal[] = [];
  tiposSoporte: TipoSoporte[] = [];
  estatusTicket: EstatusTicket[] = [];
  prioridadesTicket: PrioridadTicket[] = [];
  categorias: Categoria[] = [];

  mostrarModalTicketDetail: boolean = false;
  mostrarModalValidarTicket: boolean = false;
  showModalChatTicket: boolean = false;
  areas: Area[] = [];
  ticket: Ticket | undefined;
  ticketAccion: Ticket | any;
  usuariosHelp: Usuario[] = [];
  usuario: any;
  ticketSeleccionado: Ticket | undefined;

  constructor(
    private ticketsService: TicketsService,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private areasService: AreasService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private categoriesService: CategoriesService,
    private supportTypesService: SupportTypesService,
    private ticketsPriorityService: TicketsPriorityService,
    private statusTicketService: StatusTicketService,
    private confirmationService: ConfirmationService,
  ) {
    this.obtenerUsuariosHelp();
    this.obtenerSucursales();
    this.obtenerPrioridadesTicket();
    this.obtenerTiposSoporte();
    this.obtenerEstatusTicket();
    this.obtenerAreas();
    this.obtenerCategorias();
  }

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerTiposSoporte() {
    this.supportTypesService.get().subscribe({
      next: (data) => {
        this.tiposSoporte = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }
  
  obtenerEstatusTicket() {
    this.statusTicketService.get().subscribe({
      next: (data) => {
        this.estatusTicket = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerPrioridadesTicket() {
    this.ticketsPriorityService.get().subscribe({
      next: (data) => {
        this.prioridadesTicket = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerAreas() {
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

  obtenerCategorias() {
    this.categoriesService.get().subscribe({
      next: (data) => {
        this.categorias = data;
        this.categorias = this.categorias.filter(x=>x.idArea == "1"); 
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

 

  obtenerNombreResponsable(id: string): string {
    let name = '';

    let temp = this.usuariosHelp.filter((x) => x.id == id);
    if (temp.length > 0) {
      name = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return name;
  }

  obtenerNombreSucursal(idSucursal: string): string {
    let str = '';
    let temp = this.sucursales.filter((x) => x.id == idSucursal);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

  getDate(tsmp: Timestamp): Date {
    // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
    const firestoreTimestamp = tsmp; // Ejemplo
    const date = firestoreTimestamp.toDate(); // Convierte a Date
    return date;
  }

  obtenerUsuariosHelp() {
    this.usersService.get().subscribe({
      next: (data) => {
        this.usuariosHelp = data;
        this.usuariosHelp = this.usuariosHelp.filter((x) => x.idRol == '4');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }


  actualizaTicket(ticket: Ticket) {
    this.ticketsService
      .update(ticket)
      .then(() => {})
      .catch((error) => console.error(error));
  }


  onClickChat(ticket: Ticket) {
    this.ticketAccion = ticket;
    this.showModalChatTicket = true;
  }

  verificarChatNoLeido(ticket: Ticket) {
    const participantes = ticket.participantesChat.sort(
      (a, b) => b.ultimoComentarioLeido - a.ultimoComentarioLeido
    );
    const participante = participantes.find(
      (p) => p.idUsuario === this.usuario.id
    );

    if (participante) {
      const ultimoComentarioLeido = this.showModalChatTicket
        ? ticket.comentarios.length
        : participante.ultimoComentarioLeido;
      const comentarios = ticket.comentarios;

      // Si el último comentario leído es menor que la longitud actual de los comentarios
      return comentarios.length > ultimoComentarioLeido;
    }

    return false;
  }

  onClickRechazar(ticket: Ticket) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message:
        'El estado del ticket se cambiará a "POR RESOLVER" ¿Desea continuar?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        ticket.idEstatusTicket = '1';
        this.ticketsService
          .update(ticket)
          .then(() => {
            this.showMessage('success', 'Success', 'Enviado correctamente');
          })
          .catch((error) => console.error(error));
      },
      reject: () => {},
    });
  }

  onClickValidar(ticket: Ticket) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message:
        'El estado del ticket se cambiará a "POR VALIDAR" ¿Desea continuar?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.ticketAccion = ticket;
        this.mostrarModalValidarTicket = true;
      },
      reject: () => {},
    });
  }

  onClickValidacionAdmin(ticket: Ticket) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message:
        'Validar ticket cerrado ¿Desea continuar?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        ticket.validacionAdmin = true; 
        this.actualizaTicket(ticket);
      },
      reject: () => {},
    });
  }

  abrirModalDetalleTicket(itemticket: Ticket | any) {
    this.mostrarModalTicketDetail = true; 
    this.ticket = itemticket; 
  }

  ManejadorDeFecha(date: Date,tk:Ticket) {
    tk!.fechaEstimacion = Timestamp.fromDate(date);
    this.actualizaTicket(tk);
  }

}
