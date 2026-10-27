import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AvatarModule } from 'ngx-avatars';
import { TooltipModule } from 'primeng/tooltip';
import { Ticket } from '../../interfaces/ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { UsersService } from '../../../usuarios/services/users.service';
import { TicketSlaGaugeComponent } from '../ticket-sla-gauge/ticket-sla-gauge.component';
import { MiniMatrizUrgenciaComponent } from '../../../categorias/components/mini-matriz-urgencia/mini-matriz-urgencia.component';

@Component({
  selector: 'app-ticket-resumen-kpis',
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    TooltipModule,
    TicketSlaGaugeComponent,
    MiniMatrizUrgenciaComponent,
  ],
  templateUrl: './ticket-resumen-kpis.component.html',
  styleUrl: './ticket-resumen-kpis.component.scss',
})
export class TicketResumenKpisComponent {
  @Input() ticket!: Ticket;
  @Input() categorias: any[] = [];

  constructor(private usersService: UsersService) {}

  getResponsable(): Usuario | undefined {
    if (!this.ticket?.idResponsable) return undefined;
    return this.usersService.usuarios.find((u) => u.id === this.ticket.idResponsable);
  }

  getInvolucrados(): Usuario[] {
    if (!this.ticket?.idInvolucrados || !this.ticket.idInvolucrados.length) return [];
    return this.usersService.usuarios.filter((u) => this.ticket.idInvolucrados.includes(u.id!));
  }
}
