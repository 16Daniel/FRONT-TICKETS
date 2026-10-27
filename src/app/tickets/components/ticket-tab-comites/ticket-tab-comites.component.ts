import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { MessageService } from 'primeng/api';
import { Ticket } from '../../interfaces/ticket.model';
import { TicketsService } from '../../services/tickets.service';
import { AreasService } from '../../../areas/services/areas.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { ResponsablesService } from '../../../usuarios/services/responsables.service';
import { Responsable } from '../../../usuarios/interfaces/responsable.interface';
import { ComitesService } from '../../../comites/services/comites.service';
import { Comite } from '../../../comites/interfaces/comite';
import { HistorialAlertasService } from '../../../alertas/service/historial-alertas.service';
import { TicketDetailHelperService } from '../../services/ticket-detail-helper.service';

@Component({
  selector: 'app-ticket-tab-comites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-tab-comites.component.html',
  styleUrl: './ticket-tab-comites.component.scss',
})
export class TicketTabComitesComponent implements OnInit, OnChanges {
  @Input() ticket!: Ticket;

  comitesSeleccionados: string[] = [];
  guardandoComites = false;

  constructor(
    private ticketsService: TicketsService,
    private messageService: MessageService,
    private areasService: AreasService,
    private usersService: UsersService,
    public responsablesService: ResponsablesService,
    public comitesService: ComitesService,
    private historialAlertasService: HistorialAlertasService,
    private helper: TicketDetailHelperService,
    private cdr: ChangeDetectorRef
  ) {}

  get areas$() {
    return this.areasService.areas$;
  }

  ngOnInit(): void {
    this.comitesSeleccionados = [...(this.ticket?.comites ?? [])];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticket']) {
      this.comitesSeleccionados = [...(this.ticket?.comites ?? [])];
    }
  }

  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

  obtenerNombreComite(idComite: string): string {
    return this.helper.obtenerNombreComite(idComite);
  }

  obtenerComite(idComite: string): Comite | undefined {
    return this.comitesService.comites.find(
      (comite) => String(comite.id) === String(idComite)
    );
  }

  obtenerResponsablesComite(comite: Comite): Responsable[] {
    return (comite.idsResponsables ?? [])
      .map((idResponsable) =>
        this.responsablesService.responsables.find(
          (responsable) => String(responsable.id) === String(idResponsable)
        )
      )
      .filter((responsable): responsable is Responsable => Boolean(responsable));
  }

  obtenerNombreArea(idArea: string | undefined, areas = this.areasService.areas): string {
    if (!idArea) return '---';
    const found = areas.find((a) => String(a.id) === String(idArea));
    return found?.nombre || `Área ${idArea}`;
  }

  obtenerAreaResponsableComite(responsable: Responsable): string {
    const usuario = this.usersService.usuarios.find(
      (item) => String(item.id) === String(responsable.idUsuario)
    );
    return this.obtenerNombreArea(usuario?.idArea);
  }

  async mostrarSwalAgregarComite(): Promise<void> {
    if (!this.ticket?.id) return;
    const comitesDisponibles = this.comitesService.comites || [];
    const seleccionados = await this.helper.mostrarSwalAgregarComite(
      comitesDisponibles,
      this.comitesSeleccionados
    );
    if (seleccionados) {
      this.comitesSeleccionados = seleccionados;
      await this.guardarComites();
    }
  }

  async guardarComites(): Promise<void> {
    if (!this.ticket?.id) return;

    this.guardandoComites = true;
    const comites = [...this.comitesSeleccionados];
    try {
      await this.ticketsService.update({ id: this.ticket.id, comites });
      this.ticket.comites = comites;

      const nombresComites = comites.map((id) => this.obtenerNombreComite(id)).join(', ');
      const mensajeBitacora =
        comites.length > 0
          ? `Ticket agregado a comité(s): <b>${nombresComites}</b>`
          : `Se removieron los comités asignados al ticket`;
      await this.helper.registrarBitacoraSistema(this.ticket.id, mensajeBitacora);
      this.cdr.markForCheck();
      this.cdr.detectChanges();

      const idsUsuarios = new Set<string>();
      for (const idComite of comites) {
        const comite = this.obtenerComite(idComite);
        for (const idResponsable of comite?.idsResponsables ?? []) {
          const responsable = this.responsablesService.responsables.find(
            (item) => String(item.id) === String(idResponsable)
          );
          if (responsable?.idUsuario) {
            idsUsuarios.add(String(responsable.idUsuario));
          }
        }
      }
      for (const idInvolucrado of this.ticket.idInvolucrados ?? []) {
        idsUsuarios.add(String(idInvolucrado));
      }
      if (this.ticket.idResponsable) {
        idsUsuarios.add(String(this.ticket.idResponsable));
      }

      try {
        const usuarios = Array.from(idsUsuarios).sort();
        const alertasExistentes = await this.historialAlertasService.obtenerAlertasPorTicketYTipo(
          this.ticket.id,
          '9'
        );
        const alertaAnterior = alertasExistentes.sort(
          (a, b) => this.obtenerFechaAlerta(b.fecha) - this.obtenerFechaAlerta(a.fecha)
        )[0];
        const comitesOrdenados = [...comites].map(String).sort();
        const huboCambios =
          !alertaAnterior ||
          !this.sonIguales(alertaAnterior.comites ?? [], comitesOrdenados) ||
          !this.sonIguales(alertaAnterior.usuarios ?? [], usuarios);

        if (huboCambios) {
          await this.historialAlertasService.registrarAlerta({
            ticketId: this.ticket.id,
            fecha: Timestamp.now(),
            idAlerta: '9',
            usuarios,
            comites: comitesOrdenados,
          });
        }
      } catch (error) {
        console.error('Error al registrar la alerta de comités:', error);
        this.showMessage(
          'warn',
          'Comités guardados',
          'Los comités se asignaron, pero no fue posible registrar la alerta.'
        );
        return;
      }

      this.showMessage('success', 'Éxito', 'Comités asignados correctamente');
    } catch (error) {
      console.error('Error al asignar comités al ticket:', error);
      this.showMessage(
        'error',
        'Error',
        error instanceof Error ? error.message : 'No se pudieron guardar los comités.'
      );
    } finally {
      this.guardandoComites = false;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }

  private sonIguales(a: string[], b: string[]): boolean {
    const valoresA = [...a].map(String).sort();
    const valoresB = [...b].map(String).sort();
    return (
      valoresA.length === valoresB.length &&
      valoresA.every((valor, indice) => valor === valoresB[indice])
    );
  }

  private obtenerFechaAlerta(fecha: Timestamp | Date | string): number {
    if (fecha instanceof Date) return fecha.getTime();
    if (typeof fecha === 'string') return new Date(fecha).getTime();
    return fecha.toDate().getTime();
  }
}
