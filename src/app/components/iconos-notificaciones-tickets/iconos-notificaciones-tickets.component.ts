import { Component, Input, SimpleChanges } from '@angular/core';
import { Ticket } from '../../models/ticket.model';
import { Usuario } from '../../models/usuario.model';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-iconos-notificaciones-tickets',
  standalone: true,
  imports: [TooltipModule],
  templateUrl: './iconos-notificaciones-tickets.component.html',
  styleUrl: './iconos-notificaciones-tickets.component.scss'
})
export class IconosNotificacionesTicketsComponent {
  @Input() tickets: Ticket[] = [];
  @Input() usuario?: Usuario;

  /**
   * TICKETS TERMINADO (POR VALIDAR DE UN ADMIN)
   */
  get ticketsNotificacionTerminadoAdmin() {
    if (this.tickets.length === 0) return 0;

    return this.tickets.filter(tk => {
      const cumpleEstatus = tk.idEstatusTicket === '3';
      const cumpleUsuario = this.usuario ? tk.idResponsables?.includes(this.usuario.id) : true;
      return cumpleEstatus && cumpleUsuario;
    }).length;
  }

  /**
   * TICKETS POR VALIDAR
   */
  get ticketsNotificacionPorValidar() {
    if (this.tickets.length === 0) return 0;

    return this.tickets.filter(tk => {
      const cumpleEstatus = tk.idEstatusTicket === '7';
      const cumpleUsuario = this.usuario ? tk.idResponsables?.includes(this.usuario.id) : true;
      return cumpleEstatus && cumpleUsuario;
    }).length;
  }

  /**
   * NUEVO TICKET
   */
  get ticketsNotificacionNuevo() {
    if (this.tickets.length === 0) return 0;

    return this.tickets.filter(tk => {
      const cumpleEstatus = tk.idEstatusTicket === '1';
      const cumpleUsuario = this.usuario ? tk.idResponsables?.includes(this.usuario.id) : true;
      return cumpleEstatus && cumpleUsuario;
    }).length;
  }

  /**
   * TICKETS TRABAJANDO
   */
  get ticketsNotificacionTrabajando() {
    if (this.tickets.length === 0) return 0;

    return this.tickets.filter(tk => {
      const cumpleEstatus = tk.idEstatusTicket === '2';
      const cumpleUsuario = this.usuario ? tk.idResponsables?.includes(this.usuario.id) : true;
      return cumpleEstatus && cumpleUsuario;
    }).length;
  }

  get ticketsNotificacionComprando() {
    if (this.tickets.length === 0) return 0;

    return this.tickets.filter(tk => {
      const cumpleEstatus = tk.idEstatusTicket === '5';
      const cumpleUsuario = this.usuario ? tk.idResponsables?.includes(this.usuario.id) : true;
      return cumpleEstatus && cumpleUsuario;
    }).length;
  }
}
