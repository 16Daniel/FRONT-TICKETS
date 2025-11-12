import { Component, Input } from '@angular/core';
import { Ticket } from '../../../models/ticket.model';

@Component({
  selector: 'app-tabla-radiografia',
  standalone: true,
  imports: [],
  templateUrl: './tabla-radiografia.component.html',
  styleUrl: './tabla-radiografia.component.scss'
})
export class TablaRadiografiaComponent {
  @Input() tickets: any[] = [];
  @Input() mantenimientos: any[] = [];

  visitas = 0;
  totalTickets = 0;
  resueltos = 0;
  pendientes = 0;
  porcentajeMtto = 0;

  ngOnChanges() {
    this.calcularResumen();
  }

  calcularResumen() {
    this.visitas = this.mantenimientos.length;
    this.totalTickets = this.tickets.length;
    this.resueltos = this.tickets.filter((ticket: Ticket) => ticket.idEstatusTicket === '3').length;
    this.pendientes = this.tickets.filter((ticket: Ticket) => ticket.idEstatusTicket !== '3').length;
    this.porcentajeMtto = this.mantenimientos.length > 0 ? 100 : 0;
  }
}
