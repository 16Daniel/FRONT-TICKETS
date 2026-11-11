import { ChangeDetectorRef, Component, Input, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subscription } from 'rxjs';

import { DetalleTicketDialogComponent } from '../../dialogs/detalle-ticket-dialog/detalle-ticket-dialog.component';
import { PriorityTicketsAccordionAnalystComponent } from '../priority-tickets-accordion-analyst/priority-tickets-accordion-analyst.component';
import { Ticket } from '../../interfaces/ticket.model';
import { Area } from '../../../areas/interfaces/area.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Compra } from '../../../compras/interfaces/compra.model';
import { TicketsService } from '../../services/tickets.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { ComprasService } from '../../../compras/services/compras.service';
import { CrearTicketDialogComponent } from '../../dialogs/crear-ticket-dialog/crear-ticket-dialog.component';
import { SolicitarCompraDialogComponent } from '../../../compras/dialogs/solicitar-compra-dialog/solicitar-compra-dialog.component';
import { HistorialTicketsDialogComponent } from '../../dialogs/historial-tickets-dialog/historial-tickets-dialog.component';
import { IconosNotificacionesTicketsComponent } from '../iconos-notificaciones-tickets/iconos-notificaciones-tickets.component';
import { TarjetaRendimientoSlaComponent, TotalesSlaDashboard } from '../tarjeta-rendimiento-sla/tarjeta-rendimiento-sla.component';

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
    TarjetaRendimientoSlaComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './tickets-tab.component.html',
  styleUrl: './tickets-tab.component.scss'
})
export class TicketsTabComponent implements OnInit {
  @Input() totalesSla?: TotalesSlaDashboard;
  @Input() loadingSla: boolean = false;
  @Input() mesNombre: string = '';

  mostrarModalGenerateTicket: boolean = false;
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
  usuario: Usuario;
  selectedtk: Ticket | undefined;
  loading: boolean = false;
  paginaCargaPrimeraVez: boolean = true;
  ultimoNuevoTicket: Ticket | null = null;
  sucursales: Sucursal[] = [];
  todasSucursales: Sucursal[] = [];
  compras: Compra[] = [];

  constructor(
    public cdr: ChangeDetectorRef,
    private ticketsService: TicketsService,
    private messageService: MessageService,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private notificationService: NotificationService,
    private purchaseService: ComprasService,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];
  }


  ngOnInit(): void {
    this.getTicketsResponsable();
    this.obtenerSucursales();
    this.obtenerCompras();
    this.notificationService.solicitarPermiso();
  }

  ngOnDestroy() {
    if (this.subscriptiontk != undefined) {
      this.subscriptiontk.unsubscribe();
    }
  }

  obtenerCompras() {
    this.purchaseService.getByUser(this.usuario.id).subscribe(result => {
      this.compras = result;
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
      await this.usersService.updateUserGuardStatus(usuario.id, usuario.esGuardia);
      localStorage.setItem('rwuserdatatk', JSON.stringify(usuario));
      window.location.reload();
    } catch (error) {
      console.error('Error actualizando modo guardia:', error);
    }
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe(result => {
      this.todasSucursales = result;

      if (this.usuario.esGuardia) {
        this.sucursales = result;
      } else {
        const idsUsuario = this.usuario.sucursales.map(s => s.id);

        this.sucursales = result.filter(sucursal =>
          idsUsuario.includes(sucursal.id)
        );
      }
    });
  }
}
