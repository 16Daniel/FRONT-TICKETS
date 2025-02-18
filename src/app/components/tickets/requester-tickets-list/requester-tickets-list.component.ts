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
import { Ticket } from '../../../models/ticket.model';
import { TableModule } from 'primeng/table';
import { Proveedor } from '../../../models/proveedor.model';
import { CommonModule } from '@angular/common';
import { CatalogosService } from '../../../services/catalogs.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Timestamp } from '@angular/fire/firestore';
import { UsersService } from '../../../services/users.service';
import { NotificationsService } from '../../../services/notifications.service';
import { TicketsService } from '../../../services/tickets.service';
import { ModalFinalizeTicketComponent } from '../../../modals/tickets/modal-finalize-ticket/modal-finalize-ticket.component';
import { ModalTicketChatComponent } from '../../../modals/tickets/modal-ticket-chat/modal-ticket-chat.component';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { Usuario } from '../../../models/usuario.model';
import { Notificacion } from '../../../models/notificacion.model';
import { RatingStarsComponent } from '../../common/rating-stars/rating-stars.component';

// type Prioridad = 'PÁNICO' | 'ALTA' | 'MEDIA' | 'BAJA';

@Component({
  selector: 'app-requester-tickets-list',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    ModalFinalizeTicketComponent,
    ModalTicketChatComponent,
    AccordionModule,
    BadgeModule,
    RatingStarsComponent
  ],
  templateUrl: './requester-tickets-list.component.html',
  styleUrl: './requester-tickets-list.component.scss',
})
export class RequesterTicketsListComponent implements OnInit, OnChanges {
  @Input() tickets: Ticket[] = [];
  @Input() mostrarAcciones: boolean = true;
  @Input() mostrarEstrellas: boolean = false;
  @Output() clickEvent = new EventEmitter<Ticket>();

  showModalFinalizeTicket: boolean = false;
  showModalChatTicket: boolean = false;
  proveedores: Proveedor[] = [];
  ticketSeleccionado: Ticket | undefined;
  userdata: any;
  usuariosHelp: Usuario[] = [];
  ticketAccion: Ticket | any;

  constructor(
    private catalogosService: CatalogosService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private usersService: UsersService,
    private confirmationService: ConfirmationService,
    private notificationsService: NotificationsService,
    private ticketsService: TicketsService
  ) {}

  ngOnInit(): void {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.obtenerProveedores();
    this.obtenerUsuariosHelp();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.observaActualizacionesChatTicket(changes);
  }

  observaActualizacionesChatTicket(changes: SimpleChanges) {
    if (changes['tickets'] && changes['tickets'].currentValue) {
      if (this.ticketAccion)
        this.ticketAccion = this.tickets.filter(
          (x) => x.id == this.ticketAccion.id
        )[0];
    }
  }

  obtenerNombreProveedor(idProveedor: string): string {
    let nombre = '';
    let proveedor = this.proveedores.filter((x) => x.id == idProveedor);
    if (proveedor.length > 0) {
      nombre = proveedor[0].nombre;
    }
    return nombre;
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

    if (value == 'PÁNICO') {
      str = 'black';
    }
    return str;
  }

  obtenerProveedores() {
    this.catalogosService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
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
    }
    catch {
      return tsmp;
    }
  }

  obtenerNombreResponsable(id: string): string {
    let nombre = '';

    let temp = this.usuariosHelp.filter((x) => x.uid == id);
    if (temp.length > 0) {
      nombre = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return nombre;
  }

  obtenerIdResponsableTicket(): string {
    let idr = '';
    for (let item of this.usuariosHelp) {
      if (item.idRol == '4') {
        const existeSucursal = item.sucursales.some(
          (x) => x.id == this.userdata.sucursales[0]
        );
        if (existeSucursal) {
          idr = item.uid;
        }
      }
    }

    return idr;
  }

  obtenerUsuariosHelp() {
    this.usersService.getusers().subscribe({
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

        let dataNot: Notificacion = {
          titulo: 'ALERTA DE PÁNICO',
          mensaje:
            'EL TICKET CON EL ID: ' +
            idTicket +
            ' HA CAMBIADO AL ESTATUS DE PÁNICO',
          uid: this.obtenerIdResponsableTicket(),
          fecha: new Date(),
          abierta: false,
          idTicket: idTicket,
          notificado: false,
        };

        let idn = this.notificationsService.addNotifiacion(dataNot);
      },
      reject: () => {},
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
}
