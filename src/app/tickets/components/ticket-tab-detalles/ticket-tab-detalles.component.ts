import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { Ticket } from '../../interfaces/ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { EstatusTicket } from '../../interfaces/estatus-ticket.model';
import { TipoSoporte } from '../../interfaces/tipo-soporte.model';
import { Bitacora } from '../../../shared/interfaces/bitacora.model';
import { TicketsService } from '../../services/tickets.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { AreasService } from '../../../areas/services/areas.service';
import { BitacoraService } from '../../../shared/services/bitacora.service';
import { HistorialAlertasService } from '../../../alertas/service/historial-alertas.service';
import { TicketDetailHelperService } from '../../services/ticket-detail-helper.service';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';
import { TicketAccionesBarComponent } from '../ticket-acciones-bar/ticket-acciones-bar.component';

@Component({
  selector: 'app-ticket-tab-detalles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    RatingStarsComponent,
    TicketAccionesBarComponent,
  ],
  templateUrl: './ticket-tab-detalles.component.html',
  styleUrl: './ticket-tab-detalles.component.scss',
})
export class TicketTabDetallesComponent implements OnInit, OnChanges {
  @Input() ticket!: Ticket;
  @Input() usuario!: Usuario;
  @Input() estatusTickets: EstatusTicket[] = [];
  @Input() tiposSoporte: TipoSoporte[] = [];
  @Input() sucursales: any[] = [];

  estatusAnterior?: string;

  constructor(
    private ticketsService: TicketsService,
    private messageService: MessageService,
    public datesHelper: DatesHelperService,
    private areasService: AreasService,
    private bitacoraService: BitacoraService,
    private historialAlertasService: HistorialAlertasService,
    private helper: TicketDetailHelperService
  ) {}

  ngOnInit(): void {
    this.estatusAnterior = this.ticket?.idEstatusTicket;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticket'] && this.ticket) {
      this.estatusAnterior = this.ticket.idEstatusTicket;
    }
  }

  get estatusTicketsOpciones(): any[] {
    return this.estatusTickets.map((s) => {
      const id = String(s.id);
      return {
        ...s,
        disabled: id === '2' || id === '3' || id === '7',
      };
    });
  }

  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

  async actualizarEstatus(idEstatusTicket: string): Promise<void> {
    if (!this.ticket) return;

    if (String(idEstatusTicket) === '8') {
      const mitigacion = await this.helper.mostrarSwalMitigacion();
      if (mitigacion) {
        await this.guardarMitigacion(idEstatusTicket, mitigacion.comentario, mitigacion.fecha);
      } else if (this.estatusAnterior && this.ticket) {
        setTimeout(() => {
          this.ticket.idEstatusTicket = this.estatusAnterior!;
        });
      }
      return;
    }

    this.ticketsService
      .update(this.ticket)
      .then(async () => {
        this.estatusAnterior = idEstatusTicket;
        const estatus = this.estatusTickets.find((x) => String(x.id) === String(idEstatusTicket));
        await this.helper.registrarBitacoraSistema(
          this.ticket.id!,
          `Estatus actualizado a: <b>${estatus?.nombre || 'Desconocido'}</b>`
        );
        this.showMessage('success', 'Éxito', 'Estatus actualizado correctamente');
      })
      .catch((error) => {
        console.error(error);
        if (this.estatusAnterior) this.ticket.idEstatusTicket = this.estatusAnterior;
      });
  }

  async guardarMitigacion(
    idEstatusTicket: string,
    comentario: string,
    fecha: string
  ): Promise<void> {
    if (!this.ticket) return;

    const estatus = this.estatusTickets.find((x) => String(x.id) === String(idEstatusTicket));
    this.ticket.idEstatusTicket = idEstatusTicket;

    try {
      await this.ticketsService.update(this.ticket);
      this.estatusAnterior = idEstatusTicket;
      await this.helper.registrarBitacoraSistema(
        this.ticket.id!,
        `Estatus actualizado a: <b>${estatus?.nombre || 'Mitigación'}</b>`
      );

      let responsable: any = null;
      const rawResp = localStorage.getItem('responsable-tareas');
      if (rawResp) {
        responsable = JSON.parse(rawResp);
      }

      const bitacoraEntry: Bitacora = {
        modulo: 'TICKETS',
        referenciaId: this.ticket.id!,
        tipo: 'MITIGACION',
        contenido: `<b>Comentario:</b> ${comentario}<br><b>Fecha Estimada:</b> ${fecha}`,
        autor: {
          id: responsable?.id || this.usuario?.id || 'SISTEMA',
          nombre:
            responsable?.nombre ||
            (this.usuario ? `${this.usuario.nombre} ${this.usuario.apellidoP}` : 'Sistema'),
          color: responsable?.color || '#94a3b8',
        },
        fechaCreacion: Timestamp.now(),
      };
      await this.bitacoraService.addEntrada(bitacoraEntry);

      let involucrados = this.ticket.idInvolucrados || [];
      if (this.ticket.idResponsable) {
        involucrados = [...involucrados, this.ticket.idResponsable];
      }
      const usuariosAlerta = new Set(involucrados);
      if (this.ticket.idResponsable) {
        usuariosAlerta.add(this.ticket.idResponsable);
      }

      try {
        await this.historialAlertasService.registrarAlerta({
          ticketId: this.ticket.id!,
          fecha: Timestamp.now(),
          idAlerta: '8',
          usuarios: Array.from(usuariosAlerta),
        });
      } catch (error) {
        console.error('Error al registrar la alerta de mitigación:', error);
        this.showMessage(
          'warn',
          'Mitigación guardada',
          'La mitigación se guardó, pero no fue posible registrar la alerta.'
        );
        return;
      }

      this.showMessage('success', 'Éxito', 'Estatus actualizado y mitigación registrada');
    } catch (error) {
      console.error('Error al guardar la mitigación:', error);
      if (this.estatusAnterior) this.ticket.idEstatusTicket = this.estatusAnterior;
      this.showMessage('error', 'Error', 'No fue posible guardar la mitigación');
    }
  }

  actualizarTipoSoporte(idTipoSoporte: string): void {
    if (!this.ticket) return;
    this.ticketsService
      .update(this.ticket)
      .then(async () => {
        const ts = this.tiposSoporte.find((x) => String(x.id) === String(idTipoSoporte));
        await this.helper.registrarBitacoraSistema(
          this.ticket.id!,
          `Tipo de asistencia actualizado a: <b>${ts?.name || (ts as any)?.nombre || 'Desconocido'}</b>`
        );
        this.showMessage('success', 'Éxito', 'Asistencia actualizada correctamente');
      })
      .catch((error) => console.error(error));
  }

  actualizarRevisionDesbloqueo(): void {
    if (!this.ticket?.id) return;
    const revisado = !!this.ticket.revisionDesbloqueo;
    this.ticketsService
      .update({ id: this.ticket.id, revisionDesbloqueo: revisado })
      .then(async () => {
        await this.helper.registrarBitacoraSistema(
          this.ticket.id!,
          revisado
            ? 'Ticket marcado como <b>REVISADO EN JUNTA DE DESBLOQUEO</b>'
            : 'Se desmarcó la <b>REVISIÓN EN JUNTA DE DESBLOQUEO</b>'
        );
        this.showMessage('success', 'Éxito', 'Revisión en junta de desbloqueo actualizada');
      })
      .catch((error) => console.error(error));
  }

  obtenerNombreTipoSoporte(id?: string | null): string {
    if (!id) return 'NO DEFINIDO';
    const ts = this.tiposSoporte.find((x) => String(x.id) === String(id));
    return ts ? ts.name || (ts as any)?.nombre || 'NO DEFINIDO' : 'NO DEFINIDO';
  }

  obtenerNombreArea(idArea: string | undefined): string {
    if (!idArea) return '---';
    const found = this.areasService.areas.find((a) => String(a.id) === String(idArea));
    return found?.nombre || `Área ${idArea}`;
  }

  obtenerNombreSucursal(idSucursal?: any): string {
    if (!idSucursal) return '---';
    const found = this.sucursales?.find((s) => String(s.id) === String(idSucursal));
    return found?.nombre || `Sucursal ${idSucursal}`;
  }

  obtenerEstatus(idStatus?: string): EstatusTicket | undefined {
    if (!idStatus) return undefined;
    return this.estatusTickets.find((s) => String(s.id) === String(idStatus));
  }

  getEstatusStyle(estatus?: EstatusTicket): any {
    const c = estatus?.color && estatus.color.startsWith('#') ? estatus.color : '#64748B';
    return {
      'background-color': c + '1A',
      color: c,
      border: '1px solid ' + c + '40',
    };
  }

  obtenerPrioridadColor(prio?: string): { bg: string; text: string; border: string } {
    switch (prio) {
      case 'Crítico':
        return { bg: '#FFF1F2', text: '#EF4444', border: '#FECDD3' };
      case 'Alto':
        return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
      case 'Medio':
        return { bg: '#FEFCE8', text: '#CA8A04', border: '#FEF08A' };
      case 'Bajo':
        return { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' };
      default:
        return { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' };
    }
  }
}
