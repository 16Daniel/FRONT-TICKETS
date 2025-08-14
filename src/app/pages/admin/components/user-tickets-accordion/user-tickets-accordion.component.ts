import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Ticket } from '../../../../models/ticket.model';
import { AdminTicketsListComponent } from '../admin-tickets-list/admin-tickets-list.component';
import { Sucursal } from '../../../../models/sucursal.model';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { Usuario } from '../../../../models/usuario.model';

@Component({
  selector: 'app-user-tickets-accordion',
  standalone: true,
  imports: [
    BadgeModule,
    CommonModule,
    FormsModule,
    AccordionModule,
    AdminTicketsListComponent,
  ],
  templateUrl: './user-tickets-accordion.component.html',
  styleUrl: './user-tickets-accordion.component.scss',
})
export class UserTicketsAccordionComponent {
  @Input() tickets: Ticket[] = [];
  @Input() usuarioAgrupacion: Usuario = new Usuario();
  @Input() sucursales: Sucursal[] = [];
  @Input() IdArea: string = '';
  usuario: Usuario | any;

  constructor(private cdr: ChangeDetectorRef) { }

  activeIndex: number = -1;
  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }


  filtrarTicketsPorSucursal(idSucursal: number | any) {
    return this.tickets.filter((x) => x.idSucursal == idSucursal);
  }

  contarTickets(idSucursal: number | any): number {
    return this.tickets.filter((x) => x.idSucursal == idSucursal && x.idEstatusTicket != '3').length;
  }

  obtenerColorTexto(value: number): string {
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

  obtenerBackGroundSucursal(value: number): string {
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

  ordenarSucursalesUser(sucursales: Sucursal[]): Sucursal[] {
    return sucursales.sort((a, b) => {
      const ticketsA = this.contarTickets(a.id);
      const ticketsB = this.contarTickets(b.id);
      return ticketsB - ticketsA; // Ordena de mayor a menor
    });
  }

  verificarTicketsNuevos(tickets: Ticket[]) {
    let nuevosTickets = tickets.filter(x => x.idEstatusTicket == '1');
    return nuevosTickets.length > 0;
  }

  verificarChatNoLeido(tickets: Ticket[]): boolean {
    return tickets.some(ticket => {
      const participantes = ticket.participantesChat.sort((a, b) => b.ultimoComentarioLeido - a.ultimoComentarioLeido);
      const participante = participantes.find((p) => p.idUsuario === this.usuario.id);

      if (participante) {
        const ultimoComentarioLeido = participante.ultimoComentarioLeido;
        const comentarios = ticket.comentarios;

        return comentarios.length > ultimoComentarioLeido; // Si hay al menos 1 chat sin leer, devuelve true
      }

      return false;
    });
  }

  verificarTicketsPendientesValidar = (tickets: Ticket[]) =>
    tickets.filter(x => x.validacionAdmin == false && x.idEstatusTicket == '3').length > 0;

}
