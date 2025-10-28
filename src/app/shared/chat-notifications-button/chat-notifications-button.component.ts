import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MensajesPendientesService } from '../../services/mensajes-pendientes.service';
import { Usuario } from '../../models/usuario.model';
import { MensajePendiente } from '../../models/mensajes-pendientes.model';
import { ModalTicketChatComponent } from '../../modals/tickets/modal-ticket-chat/modal-ticket-chat.component';
import { TicketsService } from '../../services/tickets.service';
import { Ticket } from '../../models/ticket.model';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { MantenimientoFactoryService } from '../../services/maintenance-factory.service';
import { ModalMaintenanceChatComponent } from '../../modals/maintenance/modal-maintenance-chat/modal-maintenance-chat.component';
import { ShoppingService } from '../../services/shopping.service';
import { AdminComprasChatComponent } from '../../pages/shopping-tickets/shopping-admin/dialogs/admin-compras-chat/admin-compras-chat.component';

@Component({
  selector: 'app-chat-notifications-button',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ModalTicketChatComponent,
    ModalMaintenanceChatComponent,
    AdminComprasChatComponent
  ],
  providers: [MessageService],
  templateUrl: './chat-notifications-button.component.html',
  styleUrl: './chat-notifications-button.component.scss'
})
export class ChatNotificationsButtonComponent implements OnInit {
  usuario!: Usuario;
  notificaciones: MensajePendiente[] = [];
  showNotifications = false;
  idArea!: string;

  private ticketSub?: Subscription;
  private mantenimientoSub?: Subscription;
  private comprasSub?: Subscription;

  ticket!: Ticket;
  mantenimiento!: any;
  compra!: any;

  mostrarModalChatTicket: boolean = false;
  mostrarModalChatMantenimiento: boolean = false;
  mostrarModalChatCompra: boolean = false;

  constructor(
    private mensajesPendientesService: MensajesPendientesService,
    private ticketsService: TicketsService,
    private cdr: ChangeDetectorRef,
    private mantenimientoFactory: MantenimientoFactoryService,
    private shopingService: ShoppingService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.mensajesPendientesService
      .obtenerPendientesPorUsuario(this.usuario.id)
      .subscribe(pendientes => {
        this.notificaciones = pendientes;
        this.cdr.detectChanges();
      });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-wrapper')) {
      this.showNotifications = false;
    }
  }

  seleccionarNotificacion(item: MensajePendiente) {
    console.log('Notificación seleccionada:', item);
    this.showNotifications = false;
    switch (item.tipoOrigen) {
      case 'Tickets':
        this.abrirChatTicket(item.idOrigen);
        break;

      case '10x10':
      case '8x8':
      case '6x6':
        this.abrirChatMantenimiento(item.idOrigen, item.tipoOrigen)
        break;

      case 'Compras':
        this.abrirChatCompras(item.idOrigen);
        break;

      case 'Pagos':
        this.abrirChatPagos(item.idOrigen);
        break;
    }
  }

  abrirChatTicket(id: string) {
    this.ticketSub?.unsubscribe();

    this.ticketSub = this.ticketsService.getById(id).subscribe(ticket => {
      this.ticket = ticket;
      this.mostrarModalChatTicket = true;
      this.cdr.detectChanges();
    });
  }

  cerrarChatTicket() {
    this.ticketSub?.unsubscribe();
    this.mostrarModalChatTicket = false;
  }

  abrirChatMantenimiento(id: string, tipoOrigen: string) {
    this.mantenimientoSub?.unsubscribe();

    switch (tipoOrigen) {
      case '10x10':
        this.idArea = '1';
        break;
      case '6x6':
        this.idArea = '2';
        break;
      case '8x8':
        this.idArea = '4';
        break;
    }
    const servicio = this.mantenimientoFactory.getService(this.idArea);
    this.mantenimientoSub = servicio.getById(id).subscribe(mantenimiento => {
      this.mantenimiento = mantenimiento;
      this.mostrarModalChatMantenimiento = true;
      this.cdr.detectChanges();
    });
  }

  cerrarChatMantenimiento() {
    this.mantenimientoSub?.unsubscribe();
    this.mostrarModalChatMantenimiento = false;
  }

  abrirChatPagos(id: string) {
    this.comprasSub?.unsubscribe();

    this.comprasSub = this.shopingService.getPagoById(id).subscribe(pago => {
      this.compra = pago;
      this.mostrarModalChatCompra = true;
      this.cdr.detectChanges();
    });
  }

  abrirChatCompras(id: string) {
    this.comprasSub?.unsubscribe();

    this.comprasSub = this.shopingService.getCompraById(id).subscribe(compra => {
      this.compra = compra;
      this.mostrarModalChatCompra = true;
      this.cdr.detectChanges();
    });
  }

  cerrarChatCompras() {
    this.comprasSub?.unsubscribe();
    this.mostrarModalChatCompra = false;
  }
}
