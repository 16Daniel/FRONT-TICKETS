import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { Ticket } from '../../interfaces/ticket.model';
import { MatrizUrgencia } from '../../interfaces/matriz-urgencia.interface';
import { MatrizAtencion } from '../../interfaces/matriz-atencion.interface';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { obtenerTiempoSla } from '../../helpers/matriz-criticidad.helper';
import { MatrizUrgenciaService } from '../../services/matriz-urgencia.service';
import { MatrizAtencionService } from '../../services/matriz-atencion.service';

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
  @Input() matrizAtencion?: MatrizAtencion | null;
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

  // Anillo interior: Atención
  radioInterior = 21;
  perimetroInterior = 2 * Math.PI * 21; // ~131.95
  offsetInterior = 131.95;
  colorInterior = '#4ADE80';
  trackColorInterior = '#EDF2F7';
  porcentajeAtencion = 0;
  horasAtencionSla = 24;
  horasAtencionTranscurridas = 0;
  atencionIniciada = false;
  atencionVencida = false;
  atencionCompletada = false;

  folioCorto = '';
  tooltipTexto = '';
  private timerId: any = null;

  private matrizUrgenciaLocal?: MatrizUrgencia | null;
  private matrizAtencionLocal?: MatrizAtencion | null;
  private subUrgencia?: Subscription;
  private subAtencion?: Subscription;
  private currentAreaUrgencia: string = '';
  private currentAreaAtencion: string = '';

  constructor(
    private datesHelper: DatesHelperService,
    private matrizUrgenciaService: MatrizUrgenciaService,
    private matrizAtencionService: MatrizAtencionService,
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
    if (changes['ticket'] || changes['matrizUrgencia'] || changes['matrizAtencion']) {
      this.cargarMatricesSiEsNecesario();
      this.calcularMetricas();
    }
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    this.subUrgencia?.unsubscribe();
    this.subAtencion?.unsubscribe();
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

    if (!this.matrizAtencion) {
      if (this.currentAreaAtencion !== idArea) {
        this.currentAreaAtencion = idArea;
        this.subAtencion?.unsubscribe();
        this.subAtencion = this.matrizAtencionService
          .obtenerMatrizPorArea(idArea)
          .subscribe({
            next: (matriz) => {
              this.matrizAtencionLocal = matriz;
              this.calcularMetricas();
              this.cdr.markForCheck();
            },
            error: (err) => console.error('Error al cargar matriz de atención en gauge:', err)
          });
      }
    } else {
      this.matrizAtencionLocal = null;
      this.subAtencion?.unsubscribe();
    }
  }

  calcularMetricas(): void {
    if (!this.ticket) return;

    this.folioCorto = this.obtenerFolioCorto(this.ticket.folio);

    // 1. CÁLCULO DE URGENCIA (Círculo Exterior)
    this.calcularUrgencia();

    // 2. CÁLCULO DE ATENCIÓN (Círculo Interior)
    this.calcularAtencion();

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

  private calcularAtencion(): void {
    const fechaAtencion = this.extraerFecha(this.ticket.fechaAtencion);

    // Meta SLA Resolución (3×3)
    const impactoAten = Math.min(3, Math.max(1, this.ticket.criticidadResolucion || this.ticket.criticidadAtencion || this.ticket.criticidadUrgencia || 2));
    const urgenciaAten = Math.min(3, Math.max(1, this.ticket.urgenciaResolucion || this.ticket.urgenciaAtencion || this.ticket.urgenciaUrgencia || 2));

    const matriz = this.matrizAtencion || this.matrizAtencionLocal;
    if (matriz && matriz.celdas && matriz.celdas.length > 0) {
      const celda = matriz.celdas.find(c => c.impacto === impactoAten && c.urgencia === urgenciaAten);
      this.horasAtencionSla = celda?.horas ?? 24;
    } else {
      this.horasAtencionSla = obtenerTiempoSla(impactoAten, urgenciaAten).horas;
    }

    if (!fechaAtencion) {
      // No ha iniciado la fase de atención
      this.atencionIniciada = false;
      this.atencionVencida = false;
      this.atencionCompletada = false;
      this.porcentajeAtencion = 0;
      this.horasAtencionTranscurridas = 0;
      this.offsetInterior = this.perimetroInterior; // Vacío
      this.colorInterior = '#CBD5E1';
      this.trackColorInterior = '#F1F5F9';
      return;
    }

    this.atencionIniciada = true;

    // Fin de Atención: si ticket ya finalizó (estatus 3 o fechaFin)
    const fechaFin = this.extraerFecha(this.ticket.fechaFin);
    if (this.ticket.idEstatusTicket === '3' || fechaFin) {
      this.atencionCompletada = true;
      const refFin = fechaFin || new Date();
      const ms = Math.max(0, refFin.getTime() - fechaAtencion.getTime());
      this.horasAtencionTranscurridas = +(ms / (1000 * 60 * 60)).toFixed(1);
    } else {
      this.atencionCompletada = false;
      const now = new Date();
      const ms = Math.max(0, now.getTime() - fechaAtencion.getTime());
      this.horasAtencionTranscurridas = +(ms / (1000 * 60 * 60)).toFixed(1);
    }

    const ratio = this.horasAtencionSla > 0 ? (this.horasAtencionTranscurridas / this.horasAtencionSla) : 0;
    this.porcentajeAtencion = Math.max(0, Math.min(100, Math.round(ratio * 100)));
    this.atencionVencida = this.horasAtencionTranscurridas > this.horasAtencionSla;

    // Offset circular
    const progressInterior = Math.min(1, Math.max(0.04, this.porcentajeAtencion / 100));
    this.offsetInterior = this.perimetroInterior * (1 - progressInterior);

    // Color semáforo Atención (tonos complementarios como en la imagen)
    if (this.atencionVencida) {
      this.colorInterior = '#F87171'; // Rojo pastel / Coral
      this.trackColorInterior = '#FEE2E2';
    } else if (this.porcentajeAtencion >= 70) {
      this.colorInterior = '#FBBF24'; // Amarillo dorado / Ámbar
      this.trackColorInterior = '#FEF3C7';
    } else {
      this.colorInterior = '#4ADE80'; // Verde claro armonioso
      this.trackColorInterior = '#EDF2F7';
    }
  }

  private generarTooltip(): void {
    const estadoUrg = this.urgenciaVencida
      ? '⚠️ Vencido'
      : (this.urgenciaAtendida ? '✅ Atendido' : '⏱ En curso');

    let estadoAten = '';
    if (!this.atencionIniciada) {
      estadoAten = '⏳ Pendiente de inicio';
    } else if (this.atencionVencida) {
      estadoAten = '⚠️ Vencido';
    } else if (this.atencionCompletada) {
      estadoAten = '✅ Finalizado';
    } else {
      estadoAten = '⏱ En proceso';
    }

    const detalleUrg = `⭕ Urgencia (Exterior): ${this.horasUrgenciaTranscurridas}h / ${this.horasUrgenciaSla}h (${this.porcentajeUrgencia}%) — ${estadoUrg}`;
    const detalleAten = this.atencionIniciada
      ? `⭕ Resolución (Interior): ${this.horasAtencionTranscurridas}h / ${this.horasAtencionSla}h (${this.porcentajeAtencion}%) — ${estadoAten}`
      : `⭕ Resolución (Interior): ${estadoAten} (SLA Meta: ${this.horasAtencionSla}h)`;

    this.tooltipTexto = `${detalleUrg}\n${detalleAten}`;
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
