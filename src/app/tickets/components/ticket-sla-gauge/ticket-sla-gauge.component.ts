import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { Ticket } from '../../interfaces/ticket.model';
import { MatrizUrgencia } from '../../interfaces/matriz-urgencia.interface';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { obtenerTiempoSla } from '../../helpers/matriz-criticidad.helper';
import { MatrizUrgenciaService } from '../../services/matriz-urgencia.service';

@Component({
  selector: 'app-ticket-sla-gauge',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  templateUrl: './ticket-sla-gauge.component.html',
  styleUrl: './ticket-sla-gauge.component.scss'
})
export class TicketSlaGaugeComponent implements OnInit, OnChanges, OnDestroy {
  @Input() ticket!: Ticket;
  @Input() matrizUrgencia?: MatrizUrgencia | null;
  @Input() size: number = 74;

  // Anillo exterior: Urgencia
  radioExterior = 30;
  perimetroExterior = 2 * Math.PI * 30; // ~188.5
  offsetExterior = 188.5;
  colorExterior = '#10B981';
  trackColorExterior = '#E2E8F0';
  porcentajeUrgencia = 0;
  horasUrgenciaSla = 24;
  horasUrgenciaTranscurridas = 0;
  urgenciaVencida = false;
  urgenciaAtendida = false;

  folioCorto = '';
  tooltipTexto = '';
  private timerId: any = null;

  private matrizUrgenciaLocal?: MatrizUrgencia | null;
  private subUrgencia?: Subscription;
  private currentAreaUrgencia: string = '';

  constructor(
    private datesHelper: DatesHelperService,
    private matrizUrgenciaService: MatrizUrgenciaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarMatricesSiEsNecesario();
    this.calcularMetricas();
    // Actualizar cada minuto para tickets activos
    this.timerId = setInterval(() => {
      this.calcularMetricas();
    }, 60000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticket'] || changes['matrizUrgencia']) {
      this.cargarMatricesSiEsNecesario();
      this.calcularMetricas();
    }
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    this.subUrgencia?.unsubscribe();
  }

  private cargarMatricesSiEsNecesario(): void {
    if (!this.ticket) return;
    const idArea = String(this.ticket.idArea || '1');

    if (!this.matrizUrgencia) {
      if (this.currentAreaUrgencia !== idArea) {
        this.currentAreaUrgencia = idArea;
        this.subUrgencia?.unsubscribe();
        this.subUrgencia = this.matrizUrgenciaService
          .obtenerMatrizPorArea(idArea)
          .subscribe({
            next: (matriz) => {
              this.matrizUrgenciaLocal = matriz;
              this.calcularMetricas();
              this.cdr.markForCheck();
            },
            error: (err) => console.error('Error al cargar matriz de urgencia en gauge:', err)
          });
      }
    } else {
      this.matrizUrgenciaLocal = null;
      this.subUrgencia?.unsubscribe();
    }
  }

  calcularMetricas(): void {
    if (!this.ticket) return;

    this.folioCorto = this.obtenerFolioCorto(this.ticket.folio);

    // 1. CÁLCULO DE URGENCIA (Círculo Exterior)
    this.calcularUrgencia();

    // 3. GENERAR TOOLTIP
    this.generarTooltip();
  }

  private calcularUrgencia(): void {
    const fechaCreacion = this.extraerFecha(this.ticket.fecha) || new Date();

    // Meta SLA Urgencia (3×3)
    const impactoUrg = Math.min(3, Math.max(1, this.ticket.criticidadUrgencia || 2));
    const urgenciaUrg = Math.min(3, Math.max(1, this.ticket.urgenciaUrgencia || 2));

    const matriz = this.matrizUrgencia || this.matrizUrgenciaLocal;
    if (matriz && matriz.celdas && matriz.celdas.length > 0) {
      const celda = matriz.celdas.find(c => c.impacto === impactoUrg && c.urgencia === urgenciaUrg);
      this.horasUrgenciaSla = celda?.horas ?? 24;
    } else {
      this.horasUrgenciaSla = obtenerTiempoSla(impactoUrg, urgenciaUrg).horas;
    }

    // Fin de Urgencia: si ya tiene fechaAtencion, el reloj se detuvo ahí
    const fechaAtencion = this.extraerFecha(this.ticket.fechaAtencion);
    if (fechaAtencion) {
      this.urgenciaAtendida = true;
      const ms = Math.max(0, fechaAtencion.getTime() - fechaCreacion.getTime());
      this.horasUrgenciaTranscurridas = +(ms / (1000 * 60 * 60)).toFixed(1);
    } else {
      this.urgenciaAtendida = false;
      const now = new Date();
      const ms = Math.max(0, now.getTime() - fechaCreacion.getTime());
      this.horasUrgenciaTranscurridas = +(ms / (1000 * 60 * 60)).toFixed(1);
    }

    const ratio = this.horasUrgenciaSla > 0 ? (this.horasUrgenciaTranscurridas / this.horasUrgenciaSla) : 0;
    this.porcentajeUrgencia = Math.max(0, Math.min(100, Math.round(ratio * 100)));
    this.urgenciaVencida = this.horasUrgenciaTranscurridas > this.horasUrgenciaSla;

    // Offset circular
    const progressExterior = Math.min(1, Math.max(0.04, this.porcentajeUrgencia / 100));
    this.offsetExterior = this.perimetroExterior * (1 - progressExterior);

    // Color semáforo Urgencia (según referencia: verde, ámbar o rojo)
    if (this.urgenciaVencida) {
      this.colorExterior = '#EF4444'; // Rojo / Vencido
      this.trackColorExterior = '#FEE2E2';
    } else if (this.porcentajeUrgencia >= 70) {
      this.colorExterior = '#F59E0B'; // Ámbar / Alerta
      this.trackColorExterior = '#FEF3C7';
    } else {
      this.colorExterior = '#10B981'; // Verde / En tiempo
      this.trackColorExterior = '#E2E8F0';
    }
  }

  private generarTooltip(): void {
    const estadoUrg = this.urgenciaVencida
      ? '⚠️ Vencido'
      : (this.urgenciaAtendida ? '✅ Atendido' : '⏱ En curso');

    this.tooltipTexto = `⭕ Urgencia: ${this.horasUrgenciaTranscurridas}h / ${this.horasUrgenciaSla}h (${this.porcentajeUrgencia}%) — ${estadoUrg}`;
  }

  private obtenerFolioCorto(folio: string | undefined): string {
    if (!folio) return '---';
    const str = String(folio).trim();
    const match = str.match(/\d+$/);
    if (match) {
      return `#${match[0]}`;
    }
    return str.startsWith('#') ? str : `#${str}`;
  }

  private extraerFecha(fechaRaw: any): Date | null {
    if (!fechaRaw) return null;
    try {
      if (fechaRaw.toDate && typeof fechaRaw.toDate === 'function') {
        return fechaRaw.toDate();
      }
      return this.datesHelper.getDate(fechaRaw);
    } catch {
      return null;
    }
  }
}
