import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

import { Usuario } from '../../../usuarios/models/usuario.model';
import { Ticket } from '../../../tickets/models/ticket.model';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { TicketsService } from '../../../tickets/services/tickets.service';
import { UsuariosService } from '../../../usuarios/services/usuarios.service';
import { AreasService } from '../../../areas/services/areas.service';
import { DetalleTicketDialogComponent } from '../../../tickets/dialogs/detalle-ticket-dialog/detalle-ticket-dialog.component';
import { ActivoFijo } from '../../models/activo-fijo.model';

@Component({
  selector: 'app-seleccionar-ticket-activo-fijo-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, TableModule, DetalleTicketDialogComponent, TooltipModule],
  templateUrl: './seleccionar-ticket-activo-fijo-dialog.component.html',
  styleUrl: './seleccionar-ticket-activo-fijo-dialog.component.scss',
})
export class SeleccionarTicketActivoFijoDialogComponent implements OnInit {
  @Input() mostrarModal: boolean = false;
  @Input() activoFijo: ActivoFijo | any;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Output() ticketSelectedEvent = new EventEmitter<Ticket>();

  usuariosHelp: Usuario[] = [];
  tickets: Ticket[] = [];
  ticketSeleccionado: Ticket | undefined;
  mostrarModalTicketDetail: boolean = false;
  loading: boolean = false;

  constructor(
    public datesHelper: DatesHelperService,
    private ticketsService: TicketsService,
    private cdr: ChangeDetectorRef,
    private usuariosService: UsuariosService,
    private areasService: AreasService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.obtenerTickets();
    this.obtenerUsuariosHelp();
  }

  onHide(): void {
    this.closeEvent.emit(false);
  }

  obtenerBackgroundColorPrioridad(value: string): string {
    if (value == '1') return '#1E1E24';
    if (value == '2') return '#EF4444';
    if (value == '3') return '#F59E0B';
    if (value == '4') return '#10B981';
    return '#94A3B8';
  }

  obtenerNombrePrioridad(value: string): string {
    if (value == '1') return 'Urgente / Hot';
    if (value == '2') return 'Alta';
    if (value == '3') return 'Media';
    if (value == '4') return 'Baja';
    return 'Sin prioridad';
  }

  onSeleccionarTicket(ticket: Ticket, event?: Event): void {
    event?.stopPropagation();
    this.ticketSelectedEvent.emit(ticket);
    this.onHide();
  }

  async obtenerTickets(): Promise<void> {
    if (!this.activoFijo) return;
    this.loading = true;
    this.cdr.detectChanges();
    try {
      const lista = await this.ticketsService.obtenerTicketsPorActivo(this.activoFijo);
      this.tickets = (lista || []).filter((item) => item.idEstatusTicket != '3');
    } catch (error) {
      console.error('Error al obtener tickets del activo fijo:', error);
      this.tickets = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  obtenerNombreArea(idArea: string): string {
    const area = this.areasService.areas.find((x) => x.id == idArea);
    return area ? area.nombre : '';
  }

  obtenerNombreResponsable(id: string): string {
    const user = this.usuariosHelp.find((x) => x.id == id);
    return user ? `${user.nombre} ${user.apellidoP}`.trim() : '';
  }

  obtenerUsuariosHelp(): void {
    this.usuariosHelp = this.usuariosService.usuarios;
  }

  showMessage(sev: string, summ: string, det: string): void {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
