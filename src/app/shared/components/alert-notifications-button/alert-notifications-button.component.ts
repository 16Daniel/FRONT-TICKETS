import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { Subscription } from 'rxjs';
import {
  ALERTA_TICKET_WHATSAPP_ID,
  CategoriaAlerta,
  HistorialAlerta,
  HistorialAlertasService
} from '../../../alertas/service/historial-alertas.service';
import { DetalleTicketDialogComponent } from '../../../tickets/dialogs/detalle-ticket-dialog/detalle-ticket-dialog.component';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { TicketsService } from '../../../tickets/services/tickets.service';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';

@Component({
  selector: 'app-alert-notifications-button',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, DetalleTicketDialogComponent],
  templateUrl: './alert-notifications-button.component.html',
  styleUrl: './alert-notifications-button.component.scss'
})
export class AlertNotificationsButtonComponent implements OnInit, OnDestroy {
  usuario!: Usuario;
  alertas: HistorialAlerta[] = [];
  categorias: CategoriaAlerta[] = [];
  showNotifications = false;
  selectedTipo = '';
  loading = true;
  loadingTicket = false;
  errorMessage = '';
  ticketDetalle?: Ticket;
  showTicketDetail = false;
  readonly marcandoComoLeidas = new Set<string>();

  private alertasSub?: Subscription;
  private categoriasSub?: Subscription;
  private ticketSub?: Subscription;

  private get idUsuario(): string {
    return String(this.usuario.id);
  }

  get opcionesTipoAlerta(): { label: string; value: string }[] {
    return [
      { label: 'Todos los tipos', value: '' },
      ...this.categorias.map(tipo => ({
        label: tipo.nombre || tipo.categoria,
        value: tipo.id
      }))
    ];
  }

  constructor(
    private historialAlertasService: HistorialAlertasService,
    private ticketsService: TicketsService,
    private cdr: ChangeDetectorRef
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    if (!this.usuario?.id) {
      this.loading = false;
      this.errorMessage = 'No se pudo identificar al usuario de la sesión.';
      return;
    }

    this.alertasSub = this.historialAlertasService
      .obtenerAlertasPorUsuario(String(this.usuario.id))
      .subscribe({
        next: alertas => {
          this.alertas = alertas;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Error al cargar las alertas:', error);
          this.errorMessage = 'No fue posible cargar las alertas.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });

    this.categoriasSub = this.historialAlertasService
      .obtenerCategorias()
      .subscribe({
        next: categorias => {
          this.categorias = categorias;
          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Error al cargar los tipos de alerta:', error);
          this.errorMessage = 'No fue posible cargar los tipos de alerta.';
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.alertasSub?.unsubscribe();
    this.categoriasSub?.unsubscribe();
    this.ticketSub?.unsubscribe();
  }

  get alertasNuevas(): HistorialAlerta[] {
    return this.filtrarPorTipo(this.alertas.filter(alerta => !this.estaLeida(alerta)));
  }

  get alertasLeidasRecientes(): HistorialAlerta[] {
    const ahora = Date.now();
    const haceTreintaDias = ahora - 30 * 24 * 60 * 60 * 1000;
    return this.filtrarPorTipo(
      this.alertas.filter(alerta => {
        if (!this.estaLeida(alerta)) return false;
        const fecha = this.obtenerFecha(alerta.fecha).getTime();
        return fecha >= haceTreintaDias && fecha <= ahora;
      })
    );
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  seleccionarTipo(tipo: string): void {
    this.selectedTipo = tipo;
  }

  async marcarComoLeida(alerta: HistorialAlerta): Promise<void> {
    if (this.marcandoComoLeidas.has(alerta.id)) return;

    this.marcandoComoLeidas.add(alerta.id);
    this.errorMessage = '';
    this.cdr.detectChanges();
    try {
      await this.historialAlertasService.marcarComoLeida(alerta.id, this.idUsuario);
      alerta.lecturas = { ...alerta.lecturas, [this.idUsuario]: true };
    } catch (error) {
      console.error('Error al marcar la alerta como leída:', error);
      this.errorMessage = 'No fue posible marcar la alerta como leída.';
    } finally {
      this.marcandoComoLeidas.delete(alerta.id);
      this.cdr.detectChanges();
    }
  }

  abrirTicket(alerta: HistorialAlerta): void {
    this.ticketSub?.unsubscribe();
    this.errorMessage = '';
    this.loadingTicket = true;
    this.ticketDetalle = undefined;

    this.ticketSub = this.ticketsService.getById(alerta.ticketId).subscribe({
      next: ticket => {
        if (!ticket) {
          this.loadingTicket = false;
          this.errorMessage = 'No se encontró el ticket asociado a esta alerta.';
          this.cdr.detectChanges();
          return;
        }

        this.ticketDetalle = ticket;
        this.showNotifications = false;
        this.showTicketDetail = true;
        this.loadingTicket = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error al cargar el ticket de la alerta:', error);
        this.loadingTicket = false;
        this.errorMessage = 'No fue posible cargar el ticket asociado a esta alerta.';
        this.cdr.detectChanges();
      }
    });
  }

  cerrarDetalleTicket(): void {
    this.showTicketDetail = false;
    this.ticketDetalle = undefined;
    this.ticketSub?.unsubscribe();
    this.cdr.detectChanges();
  }

  obtenerNombreTipo(idAlerta: string): string {
    const categoria = this.categorias.find(tipo => tipo.id === idAlerta);
    if (categoria) return categoria.nombre || categoria.categoria || 'Alerta';
    return idAlerta === ALERTA_TICKET_WHATSAPP_ID ? 'Ticket con alerta WhatsApp' : 'Alerta';
  }

  obtenerFecha(fecha: HistorialAlerta['fecha']): Date {
    if (fecha instanceof Date) return fecha;
    if (typeof fecha === 'string') return new Date(fecha);
    return fecha.toDate();
  }

  private filtrarPorTipo(alertas: HistorialAlerta[]): HistorialAlerta[] {
    return this.selectedTipo
      ? alertas.filter(alerta => alerta.idAlerta === this.selectedTipo)
      : alertas;
  }

  private estaLeida(alerta: HistorialAlerta): boolean {
    return alerta.lecturas?.[this.idUsuario] === true;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.alert-notification-wrapper')) {
      this.showNotifications = false;
    }
  }
}
