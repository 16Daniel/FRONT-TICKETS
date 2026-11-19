import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AvatarModule } from 'ngx-avatars';
import { TooltipModule } from 'primeng/tooltip';
import { Ticket } from '../../models/ticket.model';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { UsuariosService } from '../../../usuarios/services/usuarios.service';
import { ResponsablesService } from '../../../usuarios/services/responsables.service';
import { TicketSlaGaugeComponent } from '../ticket-sla-gauge/ticket-sla-gauge.component';
import { MiniMatrizUrgenciaComponent } from '../mini-matriz-urgencia/mini-matriz-urgencia.component';

export interface InvolucradoDisplay {
  id: string;
  nombreCompleto: string;
  color?: string;
}

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

  constructor(
    private UsuariosService: UsuariosService,
    private responsablesService: ResponsablesService
  ) {}

  getResponsable(): Usuario | undefined {
    if (!this.ticket?.idResponsable) return undefined;
    return this.UsuariosService.usuarios.find((u) => u.id === this.ticket.idResponsable);
  }

  getInvolucrados(): InvolucradoDisplay[] {
    const resultado: InvolucradoDisplay[] = [];
    const idsUsuariosAgregados = new Set<string>();
    const idsResponsablesAgregados = new Set<string>();

    // 1. Usuarios de idInvolucrados
    if (this.ticket?.idInvolucrados?.length) {
      const usuarios = this.UsuariosService.usuarios.filter((u) =>
        this.ticket.idInvolucrados.includes(u.id!)
      );
      for (const u of usuarios) {
        const idStr = String(u.id);
        if (!idsUsuariosAgregados.has(idStr)) {
          idsUsuariosAgregados.add(idStr);
          resultado.push({
            id: `u-${idStr}`,
            nombreCompleto: `${u.nombre || ''} ${u.apellidoP || ''}`.trim(),
          });
        }
      }
    }

    // 2. Responsables de usuariosEtiquetados
    if (this.ticket?.usuariosEtiquetados?.length) {
      for (const idEtiquetado of this.ticket.usuariosEtiquetados) {
        const resp = this.responsablesService.responsables.find(
          (r) => String(r.id) === String(idEtiquetado) || String(r.idUsuario) === String(idEtiquetado)
        );
        if (resp) {
          const idRespStr = String(resp.id);
          const idUsuStr = resp.idUsuario ? String(resp.idUsuario) : '';

          if (idsResponsablesAgregados.has(idRespStr)) continue;
          if (idUsuStr && idsUsuariosAgregados.has(idUsuStr)) continue;

          idsResponsablesAgregados.add(idRespStr);
          if (idUsuStr) idsUsuariosAgregados.add(idUsuStr);

          resultado.push({
            id: `r-${idRespStr}`,
            nombreCompleto: resp.nombre.trim(),
            color: resp.color,
          });
        }
      }
    }

    return resultado;
  }
}
