import { Component, EventEmitter, Input, OnInit, Output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';

import { RequesterTicketsListComponent } from '../requester-tickets-list/requester-tickets-list.component';
import { GraficaTickets30DiasComponent } from '../../../mantenimientos/components/grafica-tickets-30-dias/grafica-tickets-30-dias.component';
import { Ticket } from '../../interfaces/ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { TpvsDevicesTableComponent } from "../tpvs-devices-table/tpvs-devices-table.component";
import { TablaTvsBocinasComponent } from "../../../mantenimientos/components/tabla-tvs-bocinas/tabla-tvs-bocinas.component";
import { NivelesAudioComponent } from '../../../mantenimientos/components/niveles-audio/niveles-audio.component';

@Component({
  selector: 'app-priority-tickets-accordion-analyst',
  standalone: true,
  imports: [
    CommonModule,
    BadgeModule,
    AccordionModule,
    RequesterTicketsListComponent,
    TooltipModule,
    FormsModule,
    GraficaTickets30DiasComponent,
    TpvsDevicesTableComponent,
    TablaTvsBocinasComponent,
    NivelesAudioComponent
],
  templateUrl: './priority-tickets-accordion-analyst.component.html',
  styleUrl: './priority-tickets-accordion-analyst.component.scss',
})
export class PriorityTicketsAccordionAnalystComponent implements OnInit {
  @Input() tickets: Ticket[] = [];
  @Input() sucursales: Sucursal[] = [];
  @Input() esEspectadorActivo: boolean = false;
  idArea = input.required<string>();

  @Output() clickEvent = new EventEmitter<Ticket>();

  itemtk: Ticket | undefined;
  showModalTicketDetail: boolean = false;
  usuario: Usuario | any;
  mostrarRadiografiaMap: { [idSucursal: string]: boolean } = {};

  constructor() {}

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  obtenerColorDeFondoSucursal(value: number): string {
    return ''; // Deprecated
  }

  obtenerClaseEstado(score: number): string {
    if (score >= 14) return 'score-critico';
    if (score >= 10) return 'score-alto';
    if (score >= 6) return 'score-medio';
    if (score >= 1) return 'score-bajo';
    return 'score-neutral';
  }

  obtenerTicketsPorSucursal(idSucursal: number | any) {
    return this.tickets.filter((x) => x.idSucursal == idSucursal);
  }

  obtenerScoreMaximoSucursal(idSucursal: number | any): number {
    const ticketsAbiertos = this.tickets.filter(x => x.idSucursal == idSucursal && x.idEstatusTicket != '3');
    if (ticketsAbiertos.length === 0) return 0;
    return Math.max(...ticketsAbiertos.map(t => t.score || 0));
  }

  ordenarSucursalesUser(catsucursales: Sucursal[]): Sucursal[] {
    return catsucursales.sort((a, b) => {
      const ticketsA = this.obtenerScoreMaximoSucursal(a.id);
      const ticketsB = this.obtenerScoreMaximoSucursal(b.id);
      return ticketsB - ticketsA; // Ordena de mayor a menor
    });
  }

  obtenerColorDeTexto(value: number): string {
    return ''; // Deprecated
  }

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.clickEvent.emit(ticket);
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

}
