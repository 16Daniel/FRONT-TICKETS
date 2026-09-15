import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';

import { RequesterTicketsListComponent } from '../requester-tickets-list/requester-tickets-list.component';
import { TpvsDevicesTableComponent } from '../tpvs-devices-table/tpvs-devices-table.component';
import { Ticket } from '../../interfaces/ticket.model';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';

@Component({
  selector: 'app-priority-tickets-accordion',
  standalone: true,
  imports: [
    RequesterTicketsListComponent,
    AccordionModule,
    BadgeModule,
    CommonModule,
    TooltipModule,
    TpvsDevicesTableComponent
  ],
  templateUrl: './priority-tickets-accordion.component.html',
  styleUrl: './priority-tickets-accordion.component.scss',
})
export class PriorityTicketsAccordionComponent implements OnInit {
  @Input() tickets: Ticket[] = [];
  @Input() esEspectadorActivo: boolean = false;
  @Input() mostrarTpvs: boolean = false;
  sucursal: Sucursal = new Sucursal;
  userdata: any;

  @Output() clickEvent = new EventEmitter<Ticket>();

  constructor(private branchesService: BranchesService) {

  }

  ngOnInit(): void {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.branchesService.getById(this.userdata.sucursales[0].id).subscribe(sucursal => this.sucursal = sucursal);
  }

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.clickEvent.emit(ticket);
  }

  obtenerContadorTickets(prioridad: string): number {
    return this.obtenerTicketsFiltrados(prioridad).length;
  }

  obtenerClaseEstadoPrioridad(prioridad: string): string {
    if (prioridad === 'Crítico') return 'score-critico';
    if (prioridad === 'Alto') return 'score-alto';
    if (prioridad === 'Medio') return 'score-medio';
    return 'score-bajo';
  }

  obtenerTicketsFiltrados(prioridad: string): Ticket[] {
    return this.tickets.filter((x) => x.prioridad === prioridad);
  }

  // toggleAccordion(index: number) {
  //   this.activeIndex = this.activeIndex === index ? null : index;
  // }

  verificarChatNoLeido(tickets: Ticket[]): boolean {
    return tickets.some(ticket => {
      const participantes = ticket.participantesChat.sort((a, b) => b.ultimoComentarioLeido - a.ultimoComentarioLeido);
      const participante = participantes.find((p) => p.idUsuario === this.userdata.id);

      if (participante) {
        const ultimoComentarioLeido = participante.ultimoComentarioLeido;
        const comentarios = ticket.comentarios;

        return comentarios.length > ultimoComentarioLeido; // Si hay al menos 1 chat sin leer, devuelve true
      }

      return false;
    });
  }

  verificarTicketsPorValidar(tickets: Ticket[]) {
    let result = tickets.filter(x => x.idEstatusTicket == '7');
    return result.length > 0;
  }

}
