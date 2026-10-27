import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { Subscription } from 'rxjs';

import { Ticket } from '../../interfaces/ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { EstatusTicket } from '../../interfaces/estatus-ticket.model';
import { TipoSoporte } from '../../interfaces/tipo-soporte.model';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { CategoriesService } from '../../../categorias/services/categories.service';
import { StatusTicketService } from '../../services/status-ticket.service';
import { SupportTypesService } from '../../services/support-types.service';
import { ResponsablesService } from '../../../usuarios/services/responsables.service';
import { Responsable } from '../../../usuarios/interfaces/responsable.interface';
import { ComitesService } from '../../../comites/services/comites.service';
import { MensajesPendientesService } from '../../../shared/services/mensajes-pendientes.service';
import { BitacoraComponent } from '../../../shared/components/bitacora/bitacora.component';

import { TicketBannersAlertComponent } from '../../components/ticket-banners-alert/ticket-banners-alert.component';
import { TicketResumenKpisComponent } from '../../components/ticket-resumen-kpis/ticket-resumen-kpis.component';
import { TicketTabDetallesComponent } from '../../components/ticket-tab-detalles/ticket-tab-detalles.component';
import { TicketTabDescripcionComponent } from '../../components/ticket-tab-descripcion/ticket-tab-descripcion.component';
import { TicketTabArchivosComponent } from '../../components/ticket-tab-archivos/ticket-tab-archivos.component';
import { TicketTabHistorialComponent } from '../../components/ticket-tab-historial/ticket-tab-historial.component';
import { TicketTabComitesComponent } from '../../components/ticket-tab-comites/ticket-tab-comites.component';

@Component({
  selector: 'app-detalle-ticket-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    TabViewModule,
    BitacoraComponent,
    TicketBannersAlertComponent,
    TicketResumenKpisComponent,
    TicketTabDetallesComponent,
    TicketTabDescripcionComponent,
    TicketTabArchivosComponent,
    TicketTabHistorialComponent,
    TicketTabComitesComponent,
  ],
  providers: [MessageService],
  templateUrl: './detalle-ticket-dialog.component.html',
  styleUrl: './detalle-ticket-dialog.component.scss',
})
export class DetalleTicketDialogComponent implements OnInit, OnChanges, OnDestroy {
  @Input() ticket: Ticket | undefined;
  @Input() showModalTicketDetail: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  usuario: Usuario;
  responsableTarea: Responsable | null;

  sucursales: any[] = [];
  categorias: any[] = [];
  estatusTickets: EstatusTicket[] = [];
  tiposSoporte: TipoSoporte[] = [];

  private statusTicketSub?: Subscription;
  private supportTypesSub?: Subscription;
  private categoriesSub?: Subscription;
  private branchesSub?: Subscription;

  constructor(
    private branchesService: BranchesService,
    private categoriesService: CategoriesService,
    private statusTicketService: StatusTicketService,
    private supportTypesService: SupportTypesService,
    public responsablesService: ResponsablesService,
    public comitesService: ComitesService,
    private mensajesPendientesService: MensajesPendientesService,
    private cdr: ChangeDetectorRef
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.responsableTarea = JSON.parse(localStorage.getItem('responsable-tareas')!);
  }

  private normalizarValoresTicket(): void {
    if (this.ticket) {
      if (this.ticket.idEstatusTicket !== undefined && this.ticket.idEstatusTicket !== null) {
        this.ticket.idEstatusTicket = String(this.ticket.idEstatusTicket);
      }
      if (this.ticket.idTipoSoporte !== undefined && this.ticket.idTipoSoporte !== null) {
        this.ticket.idTipoSoporte = String(this.ticket.idTipoSoporte);
      }
    }
  }

  private marcarNotificacionesLeidas(): void {
    if (this.ticket?.id && this.usuario?.id) {
      this.mensajesPendientesService.marcarComoLeidos(
        this.ticket.id,
        'Tickets',
        this.usuario.id
      );
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticket'] && this.ticket) {
      this.normalizarValoresTicket();
      this.marcarNotificacionesLeidas();
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
    if (changes['showModalTicketDetail'] && this.showModalTicketDetail) {
      this.marcarNotificacionesLeidas();
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }

  onShow(): void {
    this.normalizarValoresTicket();
    this.marcarNotificacionesLeidas();
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.normalizarValoresTicket();
    this.marcarNotificacionesLeidas();

    this.sucursales = (this.branchesService as any).sucursales || [];
    if (!this.sucursales || this.sucursales.length === 0) {
      this.branchesSub = this.branchesService.get().subscribe({
        next: (data) => {
          this.sucursales = data;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: () => {},
      });
    }

    this.categoriesSub = this.categoriesService.get().subscribe({
      next: (data) => {
        this.categorias = data.map((item: any) => ({
          ...item,
          id: item.id.toString(),
        }));
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {},
    });

    this.statusTicketSub = this.statusTicketService.get().subscribe({
      next: (data) => {
        this.estatusTickets = (data || []).map((item: any) => ({
          ...item,
          id: String(item.id),
        }));
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {},
    });

    this.supportTypesSub = this.supportTypesService.get().subscribe({
      next: (data) => {
        this.tiposSoporte = (data || []).map((item: any) => ({
          ...item,
          id: String(item.id),
          name: item.name || item.nombre || '',
          nombre: item.nombre || item.name || '',
        }));
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  ngOnDestroy(): void {
    this.statusTicketSub?.unsubscribe();
    this.supportTypesSub?.unsubscribe();
    this.categoriesSub?.unsubscribe();
    this.branchesSub?.unsubscribe();
  }

  get puedeAccederBitacoraComite(): boolean {
    const idResponsable = this.responsableTarea?.id;
    if (!idResponsable) return false;

    return (this.ticket?.comites ?? []).some((idComite) => {
      const comite = this.comitesService.comites.find(
        (c) => String(c.id) === String(idComite)
      );
      return comite?.idsResponsables?.some(
        (idAsignado) => String(idAsignado) === String(idResponsable)
      );
    });
  }

  onHide(): void {
    this.closeEvent.emit();
  }
}
