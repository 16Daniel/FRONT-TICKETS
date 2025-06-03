import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';

import { Ticket } from '../../../models/ticket.model';
import { UsersService } from '../../../services/users.service';
import { TicketsService } from '../../../services/tickets.service';
import { ModalFinalizeTicketComponent } from '../../../modals/tickets/modal-finalize-ticket/modal-finalize-ticket.component';
import { ModalTicketChatComponent } from '../../../modals/tickets/modal-ticket-chat/modal-ticket-chat.component';
import { Usuario } from '../../../models/usuario.model';
import { RatingStarsComponent } from '../../common/rating-stars/rating-stars.component';
import { AreasService } from '../../../services/areas.service';
import { Area } from '../../../models/area';
import { StatusTicketService } from '../../../services/status-ticket.service';
import { EstatusTicket } from '../../../models/estatus-ticket.model';
import { ModalValidateTicketComponent } from '../../../modals/tickets/modal-validate-ticket/modal-validate-ticket.component';
import { Sucursal } from '../../../models/sucursal.model';
import { BranchesService } from '../../../services/branches.service';

@Component({
  selector: 'app-requester-tickets-list',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    ModalFinalizeTicketComponent,
    ModalTicketChatComponent,
    ModalValidateTicketComponent,
    AccordionModule,
    BadgeModule,
    RatingStarsComponent,
    TooltipModule,
    ConfirmDialogModule,
    DropdownModule,
    FormsModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './requester-tickets-list.component.html',
  styleUrl: './requester-tickets-list.component.scss',
})
export class RequesterTicketsListComponent implements OnInit, OnChanges {
  @Input() tickets: Ticket[] = [];
  @Input() mostrarAcciones: boolean = true;
  @Input() mostrarAccionChat: boolean = true;
  @Input() mostrarAccionPanico: boolean = true;
  @Input() mostrarAccionFinalizar: boolean = true;
  @Input() mostrarEstrellas: boolean = true;
  @Input() mostrarFedchaEstimacion: boolean = true;
  @Input() mostrarAccionValidar: boolean = true;
  @Input() esEspectadorActivo: boolean = false;

  @Output() clickEvent = new EventEmitter<Ticket>();

  showModalFinalizeTicket: boolean = false;
  mostrarModalValidarTicket: boolean = false;
  showModalChatTicket: boolean = false;
  areas: Area[] = [];
  ticketSeleccionado: Ticket | undefined;
  usuario: any;
  usuariosHelp: Usuario[] = [];
  ticketAccion: Ticket | any;
  chatsSinLeer = 0;
  estatusTickets: EstatusTicket[] = [];
  sucursales: Sucursal[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private usersService: UsersService,
    private confirmationService: ConfirmationService,
    private ticketsService: TicketsService,
    private areasService: AreasService,
    private statusTicketsService: StatusTicketService,
    private branchesService: BranchesService,
  ) {
    this.obtenerCatalogoEstatusTickets();
    this.obtenerSucursales();
  }

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.obtenerAreas();
    this.obtenerUsuariosHelp();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.observaActualizacionesChatTicket(changes);
  }

  obtenerCatalogoEstatusTickets() {
    this.statusTicketsService
      .get()
      .subscribe((result) => (this.estatusTickets = result));
  }

  observaActualizacionesChatTicket(changes: SimpleChanges) {
    if (changes['tickets'] && changes['tickets'].currentValue) {
      if (this.ticketAccion)
        this.ticketAccion = this.tickets.filter(
          (x) => x.id == this.ticketAccion.id
        )[0];
    }
  }

  obtenerNombreArea(idArea: string): string {
    let nombre = '';
    let area = this.areas.filter((x) => x.id == idArea);
    if (area.length > 0) {
      nombre = area[0].nombre;
    }
    return nombre;
  }

  obtenerNombreSucursal(idSucursal: string): string {
    let str = '';
    let temp = this.sucursales.filter((x) => x.id == idSucursal);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

  obtenerBackgroundColorPrioridad(value: string): string {
    let str = '';

    if (value == '2') {
      str = '#ff0000';
    }

    if (value == '3') {
      str = '#ffe800';
    }

    if (value == '4') {
      str = '#61ff00';
    }

    if (value == '1') {
      str = 'black';
    }
    return str;
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

  onClick() {
    this.clickEvent.emit(this.ticketSeleccionado);
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
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

  obtenerNombreResponsable(id: string): string {
    let nombre = '';

    let temp = this.usuariosHelp.filter((x) => x.id == id);
    if (temp.length > 0) {
      nombre = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return nombre;
  }

  obtenerUsuariosHelp() {
    this.usersService.get().subscribe({
      next: (data) => {
        this.usuariosHelp = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  actualizaTicketEstatusSucursal(idTicket: string) {
    let temp = this.tickets.filter((x) => x.id == idTicket);
    if (temp.length > 0) {
      let ticket = temp[0];
      ticket.idPrioridadTicket = '1';

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

  onPanicoClick(idTicket: string) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: 'El estado del ticket se cambiará a Pánico ¿Desea continuar?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.actualizaTicketEstatusSucursal(idTicket);
      },
      reject: () => { },
    });
  }

  onClickFinalizar(ticket: Ticket) {
    this.ticketAccion = ticket;
    this.showModalFinalizeTicket = true;
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

  obtenerNombreEstatusTicket(idEstatusTicket: string) {
    if (this.estatusTickets.length == 0) return;
    let nombre: string = this.estatusTickets.filter(
      (x) => x.id == idEstatusTicket
    )[0].nombre;

    return nombre;
  }

  actualizaTicket(ticket: Ticket) {
    this.ticketsService
      .update(ticket)
      .then(() => { })
      .catch((error) => console.error(error));
  }

  filrarEstatusTickets() {
    return this.estatusTickets.filter((x) => x.id == '1' || x.id == '2');
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
      reject: () => { },
    });
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
      reject: () => { },
    });
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
}
