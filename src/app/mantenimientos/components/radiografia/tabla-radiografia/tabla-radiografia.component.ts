import { Component, Input } from '@angular/core';

import { MantenimientoFactoryService } from '../../../services/maintenance-factory.service';
import { Ticket } from '../../../../tickets/interfaces/ticket.model';

@Component({
  selector: 'app-tabla-radiografia',
  standalone: true,
  imports: [],
  templateUrl: './tabla-radiografia.component.html',
  styleUrl: './tabla-radiografia.component.scss'
})
export class TablaRadiografiaComponent {
  @Input() tickets: any[] = [];
  @Input() idArea!: string;
  @Input() idSucursal!: string;
  mantenimientos: any[] = [];

  visitas = 0;
  totalTickets = 0;
  resueltos = 0;
  pendientes = 0;
  porcentajeMtto = 0;

  constructor(private mantenimientoFactory: MantenimientoFactoryService) { }

  async ngOnChanges() {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    const servicio = this.mantenimientoFactory.getService(this.idArea);
    this.mantenimientos = await servicio.obtenerMantenimientosEntreFechas(hace30Dias, hoy);
    this.mantenimientos = this.mantenimientos.filter(x => x.idSucursal == this.idSucursal);
    this.mantenimientos = this.mantenimientos.filter(x => x.estatus == false);

    this.calcularResumen();
  }

  calcularResumen() {
    this.visitas = this.mantenimientos.length;
    this.totalTickets = this.tickets.length;
    this.resueltos = this.tickets.filter((ticket: Ticket) => ticket.idEstatusTicket === '3').length;
    this.pendientes = this.tickets.filter((ticket: Ticket) => ticket.idEstatusTicket !== '3').length;
    const servicio = this.mantenimientoFactory.getService(this.idArea);
    this.porcentajeMtto = servicio.calcularPorcentaje(this.mantenimientos[0]);
  }
}
