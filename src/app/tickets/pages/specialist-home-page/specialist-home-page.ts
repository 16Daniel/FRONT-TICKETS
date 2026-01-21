import { ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { ModalTicketDetailComponent } from '../../../tickets/dialogs/modal-ticket-detail/modal-ticket-detail.component';
import { ModalValidateTicketComponent } from '../../../tickets/dialogs/modal-validate-ticket/modal-validate-ticket.component';
import { ModalTicketChatComponent } from '../../../tickets/dialogs/modal-ticket-chat/modal-ticket-chat.component';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { Ticket } from '../../../tickets/models/ticket.model';
import { EstatusTicket } from '../../../tickets/models/estatus-ticket.model';
import { Area } from '../../../areas/models/area.model';
import { TicketsService } from '../../../tickets/services/tickets.service';
import { StatusTicketService } from '../../../tickets/services/status-ticket.service';
import { AreasService } from '../../../areas/services/areas.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { Comentario } from '../../../shared/interfaces/comentario-chat.model';

@Component({
  selector: 'app-specialist-home-page',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TooltipModule,
    ModalTicketDetailComponent,
    ConfirmDialogModule,
    ModalValidateTicketComponent,
    ModalTicketChatComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './specialist-home-page.html',
  styleUrl: './specialist-home-page.scss'
})

export default class SpecialistHomePage implements OnInit, OnChanges {
  usuario: Usuario;
  tickets: Ticket[] = [];
  ticketSeleccionado: Ticket = new Ticket;
  estatusTickets: EstatusTicket[] = [];
  areas: Area[] = [];
  sucursales: Sucursal[] = [];
  usuariosHelp: Usuario[] = [];
  ticket: Ticket | undefined;
  mostrarModalTicketDetail: boolean = false;
  mostrarModalValidarTicket: boolean = false;
  mostrarModalChatTicket: boolean = false;

  constructor(
    private ticketsService: TicketsService,
    private statusTicketsService: StatusTicketService,
    private areasService: AreasService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private branchesService: BranchesService,
    private usersService: UsersService,
    private confirmationService: ConfirmationService,
    public datesHelper: DatesHelperService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);

    this.areasService.areas$.subscribe(areas => this.areas = areas);
  }

  ngOnInit(): void {
    this.getTicketsPorEspecialista();
    this.obtenerCatalogoEstatusTickets();
    this.obtenerSucursales();
    this.obtenerUsuariosHelp();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.observaActualizacionesChatTicket(changes);
  }

  getTicketsPorEspecialista() {
    this.ticketsService.getTicketsPorEspecialista(this.usuario.id)
      .subscribe(result => {
        this.tickets = result;
        this.cdr.detectChanges()
      });
  }

  obtenerNombreEstatusTicket(idEstatusTicket: string) {
    if (this.estatusTickets.length == 0) return;
    let nombre: string = this.estatusTickets.filter(
      (x) => x.id == idEstatusTicket
    )[0].nombre;

    return nombre;
  }

  obtenerCatalogoEstatusTickets() {
    this.statusTicketsService
      .get()
      .subscribe((result) => (this.estatusTickets = result));
  }

  obtenerNombreArea(idArea: string): string {
    let nombre = '';
    let area = this.areas.filter((x) => x.id == idArea);
    if (area.length > 0) {
      nombre = area[0].nombre;
    }
    return nombre;
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
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

  obtenerNombreResponsable(id: string): string {
    let nombre = '';

    let temp = this.usuariosHelp.filter((x) => x.id == id);
    if (temp.length > 0) {
      nombre = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return nombre;
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

  obtenerUsuariosHelp() {
    this.usersService.usuarios$.subscribe(usuarios => this.usuariosHelp = usuarios);
  }

  onClickRechazar(ticket: Ticket) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message:
        'Deseas regresar este ticket?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        ticket.idUsuarioEspecialista = '';
        ticket.esAsignadoEspecialista = false;

        let nuevoMensaje: Comentario = {
          nombre: this.usuario?.nombre + ' ' + this.usuario?.apellidoP,
          idUsuario: this.usuario?.id,
          comentario: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <p><strong>Este ticket se asigna al siguiente analista:</strong></p>
              <ul>
                <li><strong>Fecha:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>Nombre:</strong> ${this.getUsuarioResponsable(ticket.idResponsableFinaliza)?.nombre} ${this.getUsuarioResponsable(ticket.idResponsableFinaliza)?.apellidoP}</li>
              </ul>
              <p>Él dará el seguimiento y finalizará este ticket.</p>
            </div>
          `,
          fecha: new Date(),
        };

        ticket!.comentarios.push(nuevoMensaje);


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

  onClickChat(ticket: Ticket) {
    this.ticketSeleccionado = ticket;
    this.mostrarModalChatTicket = true;
  }

  verificarChatNoLeido(ticket: Ticket) {
    const participantes = ticket.participantesChat.sort(
      (a, b) => b.ultimoComentarioLeido - a.ultimoComentarioLeido
    );
    const participante = participantes.find(
      (p) => p.idUsuario === this.usuario.id
    );

    if (participante) {
      const ultimoComentarioLeido = this.mostrarModalChatTicket
        ? ticket.comentarios.length
        : participante.ultimoComentarioLeido;
      const comentarios = ticket.comentarios;

      // Si el último comentario leído es menor que la longitud actual de los comentarios
      return comentarios.length > ultimoComentarioLeido;
    }

    return false;
  }

  observaActualizacionesChatTicket(changes: SimpleChanges) {
    if (changes['tickets'] && changes['tickets'].currentValue) {
      if (this.ticketSeleccionado)
        this.ticketSeleccionado = this.tickets.filter(
          (x) => x.id == this.ticketSeleccionado.id
        )[0];
    }
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
        this.ticketSeleccionado = ticket;
        this.mostrarModalValidarTicket = true;
      },
      reject: () => { },
    });
  }

  getUsuarioResponsable(idResponsableFinaliza: string) {
    return this.usuariosHelp.find(x => x.id == idResponsableFinaliza)
  }
}
