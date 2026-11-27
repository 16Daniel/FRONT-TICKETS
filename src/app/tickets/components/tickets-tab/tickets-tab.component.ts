import { ChangeDetectorRef, Component, Input, OnDestroy, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { combineLatest, Subscription } from 'rxjs';

import { DetalleTicketDialogComponent } from '../../dialogs/detalle-ticket-dialog/detalle-ticket-dialog.component';
import { PriorityTicketsAccordionAnalystComponent } from '../priority-tickets-accordion-analyst/priority-tickets-accordion-analyst.component';
import { Ticket } from '../../models/ticket.model';
import { Area } from '../../../areas/models/area.model';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { Compra } from '../../../compras/interfaces/compra.model';
import { TicketsService } from '../../services/tickets.service';
import { UsuariosService } from '../../../usuarios/services/usuarios.service';
import { SucursalesService } from '../../../sucursales/services/sucursales.service';
import { UsuarioSucursalService } from '../../../sucursales/services/usuario-sucursal.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { Sucursal } from '../../../sucursales/models/sucursal.model';
import { ComprasService } from '../../../compras/services/compras.service';
import { CrearTicketDialogComponent } from '../../dialogs/crear-ticket-dialog/crear-ticket-dialog.component';
import { SolicitarCompraDialogComponent } from '../../../compras/dialogs/solicitar-compra-dialog/solicitar-compra-dialog.component';
import { HistorialTicketsDialogComponent } from '../../dialogs/historial-tickets-dialog/historial-tickets-dialog.component';
import { IconosNotificacionesTicketsComponent } from '../iconos-notificaciones-tickets/iconos-notificaciones-tickets.component';
import { TarjetaRendimientoSlaComponent, TotalesSlaDashboard } from '../tarjeta-rendimiento-sla/tarjeta-rendimiento-sla.component';
import { AcordeonTicketsPorPrioridadComponent } from '../acordeon-tickets-por-prioridad/acordeon-tickets-por-prioridad.component';

@Component({
  selector: 'app-tickets-tab',
  standalone: true,
  imports: [
    TableModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    CrearTicketDialogComponent,
    DetalleTicketDialogComponent,
    HistorialTicketsDialogComponent,
    FormsModule,
    PriorityTicketsAccordionAnalystComponent,
    SolicitarCompraDialogComponent,
    IconosNotificacionesTicketsComponent,
    TarjetaRendimientoSlaComponent,
    AcordeonTicketsPorPrioridadComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './tickets-tab.component.html',
  styleUrl: './tickets-tab.component.scss'
})
export class TicketsTabComponent implements OnInit, OnDestroy {
  @Input() totalesSla?: TotalesSlaDashboard;
  @Input() loadingSla: boolean = false;
  @Input() mesNombre: string = '';

  mostrarModalGenerateTicket: boolean = false;
  ticketRapido: boolean = false;
  mostrarModalFilterTickets: boolean = false;
  mostrarModalTicketDetail: boolean = false;
  mostrarModalHistorial: boolean = false;
  mostrarModalCompras: boolean = false;

  itemtk: Ticket | undefined;
  sucursal: Sucursal | undefined;
  tickets: Ticket[] = [];
  todosLosTickets: Ticket[] = [];
  areas: Area[] = [];
  subscriptiontk: Subscription | undefined;
  private subscriptionSucursales?: Subscription;
  private subscriptionCompras?: Subscription;
  usuario: Usuario;
  selectedtk: Ticket | undefined;
  loading: boolean = false;
  paginaCargaPrimeraVez: boolean = true;
  ultimoNuevoTicket: Ticket | null = null;
  sucursales: Sucursal[] = [];
  todasSucursales: Sucursal[] = [];
  compras: Compra[] = [];
  agruparPorPrioridad: boolean = false;

  constructor(
    public cdr: ChangeDetectorRef,
    private ticketsService: TicketsService,
    private messageService: MessageService,
    private UsuariosService: UsuariosService,
    private branchesService: SucursalesService,
    private usuarioSucursalService: UsuarioSucursalService,
    private notificationService: NotificationService,
    private purchaseService: ComprasService,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario?.idSucursal
      ? ({ id: String(this.usuario.idSucursal), nombre: '' } as Sucursal)
      : undefined;
  }


  ngOnInit(): void {
    this.getTicketsResponsable();
    this.obtenerSucursales();
    this.obtenerCompras();
    this.notificationService.solicitarPermiso();
  }

  ngOnDestroy() {
    this.subscriptiontk?.unsubscribe();
    this.subscriptionSucursales?.unsubscribe();
    this.subscriptionCompras?.unsubscribe();
  }

  obtenerCompras() {
    this.subscriptionCompras?.unsubscribe();
    this.subscriptionCompras = this.purchaseService.getByUser(this.usuario.id).subscribe(result => {
      this.compras = result;
      this.cdr.detectChanges();
    });
  }


  async getTicketsResponsable(): Promise<void> {
    this.loading = true;
    this.subscriptiontk = this.ticketsService
      .getTicketsResponsable(this.usuario.id, this.usuario.esGuardia, this.usuario.idArea)
      .subscribe({
        next: (data) => {
          // El ticket más reciente se calcula antes de ordenar por prioridad
          const ticketMasReciente = [...data].sort((a, b) => this.obtenerTiempoTicket(b) - this.obtenerTiempoTicket(a))[0];
          data = this.ordenarTickets(data);
          if (
            data.length > this.todosLosTickets.length &&
            !this.paginaCargaPrimeraVez
          ) {
            this.tickets = data;
            this.todosLosTickets = data;
            this.ultimoNuevoTicket = ticketMasReciente;
            this.notificationService.enviarNotificacion('NUEVO TICKET ASIGNADO', 'SUCURSAL: ' + this.sucursales.filter(x => x.id == this.ultimoNuevoTicket?.idSucursal)[0].nombre);
            this.showMessage('info', 'NUEVO TICKET ASIGNADO', 'SUCURSAL: ' + this.sucursales.filter(x => x.id == this.ultimoNuevoTicket?.idSucursal)[0].nombre, 100000);
          }
          else {
            this.tickets = data;
            this.todosLosTickets = data;
          }

          this.paginaCargaPrimeraVez = false;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al escuchar los tickets:', error);
        },
      });
  }

  /** Mismo orden que la vista de administrador: prioridad (score) descendente y luego fecha más reciente. */
  private ordenarTickets(tickets: Ticket[]): Ticket[] {
    return [...tickets].sort((a, b) => {
      const scoreA = (a as any).score || (((a as any).criticidad && (a as any).urgencia) ? (a as any).criticidad * (a as any).urgencia : 4);
      const scoreB = (b as any).score || (((b as any).criticidad && (b as any).urgencia) ? (b as any).criticidad * (b as any).urgencia : 4);
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      return this.obtenerTiempoTicket(b) - this.obtenerTiempoTicket(a);
    });
  }

  private obtenerTiempoTicket(t: Ticket): number {
    return t.fecha?.toDate ? t.fecha.toDate().getTime() : (t.fecha ? new Date(t.fecha).getTime() : 0);
  }

  get ticketsDeSucursalesAsignadas(): Ticket[] {
    return this.tickets.filter(ticket =>
      this.sucursales.some(sucursal => String(sucursal.id) === String(ticket.idSucursal))
    );
  }

  cambiarAgrupacionPorPrioridad(agrupar: boolean): void {
    this.agruparPorPrioridad = agrupar;
    this.cdr.detectChanges();
  }

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.itemtk = ticket;
    this.mostrarModalTicketDetail = true;

    setTimeout(() => {
      var accordionItems = document.querySelectorAll('.accordion-collapse');
      accordionItems.forEach(function (item) {
        item.classList.remove('show'); // Cierra todas las secciones del accordion
      });
    }, 50);
  }

  showMessage(sev: string, summ: string, det: string, timeout: number = 3000) {
    this.messageService.add({ severity: sev, summary: summ, detail: det, life: timeout });
  }

  async onToggleGuardia(usuario: any): Promise<void> {
    if (!usuario || !usuario.id) return;

    try {
      await this.UsuariosService.updateUserGuardStatus(usuario.id, usuario.esGuardia);
      localStorage.setItem('rwuserdatatk', JSON.stringify(usuario));
      window.location.reload();
    } catch (error) {
      console.error('Error actualizando modo guardia:', error);
    }
  }

  obtenerSucursales() {
    this.subscriptionSucursales?.unsubscribe();
    this.subscriptionSucursales = combineLatest([
      this.branchesService.get(),
      this.usuarioSucursalService.usuarioSucursal$,
    ]).subscribe(([result]) => {
      this.todasSucursales = result;

      if (this.usuario.esGuardia) {
        this.sucursales = result;
      } else {
        const idsSoporte = this.usuarioSucursalService.obtenerSucursalesPorUsuario(
          'SOPORTE',
          String(this.usuario.id),
          this.usuario.idArea
        );

        this.sucursales = result.filter(sucursal =>
          idsSoporte.includes(String(sucursal.id))
        );
      }

      this.cdr.detectChanges();
    });
  }
}
