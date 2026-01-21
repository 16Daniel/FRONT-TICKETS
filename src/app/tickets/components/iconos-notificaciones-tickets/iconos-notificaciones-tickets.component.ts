import { Component, Input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

import { Ticket } from '../../models/ticket.model';
import { Compra } from '../../../compras/models/compra.model';
import { Usuario } from '../../../usuarios/models/usuario.model';

@Component({
  selector: 'app-iconos-notificaciones-tickets',
  standalone: true,
  imports: [TooltipModule],
  templateUrl: './iconos-notificaciones-tickets.component.html',
  styleUrl: './iconos-notificaciones-tickets.component.scss'
})
export class IconosNotificacionesTicketsComponent {
  @Input() tickets: Ticket[] = [];
  @Input() compras: Compra[] = [];
  @Input() usuario?: Usuario;

  /**
   * Devuelve los ids de sucursales del usuario
   */
  private get sucursalesUsuario(): string[] {
    return this.usuario?.sucursales?.map(s => s.id) ?? [];
  }

  /**
   * TICKETS TERMINADO (POR VALIDAR DE UN ADMIN)
   */
  get ticketsNotificacionTerminadoAdmin() {
    if (this.tickets.length === 0) return 0;

    return this.tickets.filter(tk => {
      const cumpleEstatus = tk.idEstatusTicket === '3';
      const cumpleSucursal = this.usuario
        ? this.sucursalesUsuario.includes(tk.idSucursal)
        : true; // ✅ si no hay usuario, no filtra por sucursal
      return cumpleEstatus && cumpleSucursal;
    }).length;
  }

  /**
   * TICKETS POR VALIDAR
   */
  get ticketsNotificacionPorValidar() {
    if (this.tickets.length === 0) return 0;

    return this.tickets.filter(tk => {
      const cumpleEstatus = tk.idEstatusTicket === '7';
      const cumpleSucursal = this.usuario
        ? this.sucursalesUsuario.includes(tk.idSucursal)
        : true;
      return cumpleEstatus && cumpleSucursal;
    }).length;
  }

  /**
   * NUEVO TICKET
   */
  get ticketsNotificacionNuevo() {
    if (this.tickets.length === 0) return 0;

    return this.tickets.filter(tk => {
      const cumpleEstatus = tk.idEstatusTicket === '1';
      const cumpleSucursal = this.usuario
        ? this.sucursalesUsuario.includes(tk.idSucursal)
        : true;
      return cumpleEstatus && cumpleSucursal;
    }).length;
  }

  /**
   * TICKETS TRABAJANDO
   */
  get ticketsNotificacionTrabajando() {
    if (this.tickets.length === 0) return 0;

    return this.tickets.filter(tk => {
      const cumpleEstatus = tk.idEstatusTicket === '2';
      const cumpleSucursal = this.usuario
        ? this.sucursalesUsuario.includes(tk.idSucursal)
        : true;
      return cumpleEstatus && cumpleSucursal;
    }).length;
  }

  /**
   * COMPRAS
   */
  get ticketsNotificacionComprando() {
    if (this.compras.length === 0) return 0;

    return this.compras.filter(compra => {
      return compra.idEstatusCompra === '1' || compra.idEstatusCompra === '2';
    }).length;
  }
}
