import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ticket } from '../../../../models/ticket.model';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { RequesterTicketsListComponent } from '../../../../components/requester-tickets-list/requester-tickets-list.component';
import { TpvsDevicesTableComponent } from '../../../../components/tpvs-devices-table/tpvs-devices-table.component';
import { Sucursal } from '../../../../models/sucursal.model';
import { BranchesService } from '../../../../services/branches.service';

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

  obtenerContadorTickets(prioridad: any): number {
    if (prioridad === 'PÁNICO')
      return this.tickets.filter((x) => x.idPrioridadTicket === '1').length;
    else if (prioridad === 'ALTA')
      return this.tickets.filter((x) => x.idPrioridadTicket === '2').length;
    else if (prioridad === 'MEDIA')
      return this.tickets.filter((x) => x.idPrioridadTicket === '3').length;
    else return this.tickets.filter((x) => x.idPrioridadTicket === '4').length;
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

  obtenerTicketsFiltrados(prioridad: string): Ticket[] {
    if (prioridad === 'PÁNICO')
      return this.tickets.filter((x) => x.idPrioridadTicket === '1');
    else if (prioridad === 'ALTA')
      return this.tickets.filter((x) => x.idPrioridadTicket === '2');
    else if (prioridad === 'MEDIA')
      return this.tickets.filter((x) => x.idPrioridadTicket === '3');
    else return this.tickets.filter((x) => x.idPrioridadTicket === '4');
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
