import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { Ticket } from '../../interfaces/ticket.model';
import { MatrizUrgencia } from '../../interfaces/matriz-urgencia.interface';
import { Categoria } from '../../interfaces/categoria.mdoel';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { obtenerTiempoSla } from '../../helpers/matriz-criticidad.helper';
import { MatrizUrgenciaService } from '../../services/matriz-urgencia.service';
import { CategoriesService } from '../../services/categories.service';

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
  @Input() categorias?: Categoria[];
  @Input() size: number = 74;

  // Anillo exterior: Matriz de Urgencia
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

  // Anillo interior: Tiempo de Resolución (Grafica de pie)
  radioInterior = 11.5;
  perimetroInterior = 2 * Math.PI * 11.5; // ~72.2566
  offsetInterior = 72.2566;
  colorInterior = '#3B82F6';
  trackColorInterior = '#EFF6FF';
  porcentajeResolucion = 0;
  horasResolucionSla = 24;
  horasResolucionTranscurridas = 0;
  resolucionVencida = false;
  resolucionCompletada = false;
  resolucionIniciada = false;
  tiempoResolucionOriginal?: number;
  unidadResolucionOriginal?: 'm' | 'h' | 'd';

  folioCorto = '';
  tooltipTexto = '';
  private timerId: any = null;

  private matrizUrgenciaLocal?: MatrizUrgencia | null;
  private subUrgencia?: Subscription;
  private currentAreaUrgencia: string = '';

  private subCategorias?: Subscription;
  private categoriasLocales: Categoria[] = [];

  constructor(
    private datesHelper: DatesHelperService,
    private matrizUrgenciaService: MatrizUrgenciaService,
    private categoriesService: CategoriesService,
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
    if (changes['ticket'] || changes['matrizUrgencia'] || changes['categorias']) {
      this.cargarMatricesSiEsNecesario();
      this.calcularMetricas();
    }
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    this.subUrgencia?.unsubscribe();
    this.subCategorias?.unsubscribe();
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

    if (!this.categorias && this.categoriasLocales.length === 0) {
      this.subCategorias = this.categoriesService.get().subscribe({
        next: (cats) => {
          this.categoriasLocales = cats || [];
          this.calcularMetricas();
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error al cargar categorías en gauge:', err)
      });
    }
  }

  calcularMetricas(): void {
    if (!this.ticket) return;

    this.folioCorto = this.obtenerFolioCorto(this.ticket.folio);

    // 1. CÁLCULO DE URGENCIA (Círculo Exterior - Matriz de Urgencia)
    this.calcularUrgencia();

    // 2. CÁLCULO DE RESOLUCIÓN (Círculo Interior - Tiempo de Resolución)
    this.calcularResolucion();

    // 3. GENERAR TOOLTIP
    this.generarTooltip();
  }

  private calcularUrgencia(): void {
    const fechaCreacion = this.extraerFecha(this.ticket.fecha) || new Date();

    // Meta SLA Urgencia (3×3)
    const impactoUrg = Math.min(3, Math.max(1, this.ticket.criticidad || 2));
    const urgenciaUrg = Math.min(3, Math.max(1, this.ticket.urgencia || 2));

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

    // Color semáforo Urgencia
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

  private resolverHorasResolucion(): number {
    this.tiempoResolucionOriginal = undefined;
    this.unidadResolucionOriginal = undefined;

    // 1. Directamente en el ticket
    if (this.ticket.horasResolucion && this.ticket.horasResolucion > 0) {
      this.tiempoResolucionOriginal = this.ticket.tiempoResolucion;
      this.unidadResolucionOriginal = this.ticket.unidadResolucion;
      return this.ticket.horasResolucion;
    }

    if (this.ticket.tiempoResolucion && this.ticket.tiempoResolucion > 0) {
      const u = this.ticket.unidadResolucion || 'h';
      this.tiempoResolucionOriginal = this.ticket.tiempoResolucion;
      this.unidadResolucionOriginal = u;
      if (u === 'm') return Math.round((this.ticket.tiempoResolucion / 60) * 100) / 100;
      if (u === 'd') return this.ticket.tiempoResolucion * 24;
      return this.ticket.tiempoResolucion;
    }

    // 2. Si tenemos categorías disponibles, buscar en la categoría/subcategoría del ticket
    const listaCategorias = (this.categorias && this.categorias.length > 0) ? this.categorias : this.categoriasLocales;
    if (listaCategorias && listaCategorias.length > 0 && (this.ticket.idCategoria || this.ticket.idSubcategoria)) {
      const cat = listaCategorias.find(c => String(c.id) === String(this.ticket.idCategoria));
      if (cat) {
        if (this.ticket.idSubcategoria && cat.subcategorias) {
          const sub = this.buscarSubcategoriaRecursiva(cat.subcategorias, String(this.ticket.idSubcategoria));
          if (sub) {
            if (sub.horasResolucion) {
              this.tiempoResolucionOriginal = sub.tiempoResolucion;
              this.unidadResolucionOriginal = sub.unidadResolucion;
              return sub.horasResolucion;
            }
            if (sub.tiempoResolucion) {
              const u = sub.unidadResolucion || 'h';
              this.tiempoResolucionOriginal = sub.tiempoResolucion;
              this.unidadResolucionOriginal = u;
              if (u === 'm') return Math.round((sub.tiempoResolucion / 60) * 100) / 100;
              if (u === 'd') return sub.tiempoResolucion * 24;
              return sub.tiempoResolucion;
            }
          }
        }
        if (cat.horasResolucion) {
          this.tiempoResolucionOriginal = cat.tiempoResolucion;
          this.unidadResolucionOriginal = cat.unidadResolucion;
          return cat.horasResolucion;
        }
        if (cat.tiempoResolucion) {
          const u = cat.unidadResolucion || 'h';
          this.tiempoResolucionOriginal = cat.tiempoResolucion;
          this.unidadResolucionOriginal = u;
          if (u === 'm') return Math.round((cat.tiempoResolucion / 60) * 100) / 100;
          if (u === 'd') return cat.tiempoResolucion * 24;
          return cat.tiempoResolucion;
        }
      }
    }

    // 3. Fallback: tiempo de urgencia o 24h
    return this.horasUrgenciaSla || 24;
  }

  private calcularResolucion(): void {
    const fechaAtencion = this.extraerFecha(this.ticket.fechaAtencion);
    this.horasResolucionSla = this.resolverHorasResolucion();

    if (!fechaAtencion) {
      this.resolucionIniciada = false;
      this.resolucionCompletada = false;
      this.horasResolucionTranscurridas = 0;
      this.porcentajeResolucion = 0;
      this.resolucionVencida = false;
      // Para que se vea completo en gris, sin progreso:
      this.offsetInterior = this.perimetroInterior; 
      this.colorInterior = '#9CA3AF'; // Gris / Pendiente
      this.trackColorInterior = '#F3F4F6';
      return;
    }

    this.resolucionIniciada = true;

    // Fin de Resolución: si el ticket ya finalizó (estatus 3 o fechaFin)
    const fechaFin = this.extraerFecha(this.ticket.fechaFin);
    const esFinalizado = this.ticket.idEstatusTicket === '3' || !!fechaFin;

    if (esFinalizado) {
      this.resolucionCompletada = true;
      const refFin = fechaFin || new Date();
      const ms = Math.max(0, refFin.getTime() - fechaAtencion.getTime());
      this.horasResolucionTranscurridas = +(ms / (1000 * 60 * 60)).toFixed(2);
    } else {
      this.resolucionCompletada = false;
      const now = new Date();
      const ms = Math.max(0, now.getTime() - fechaAtencion.getTime());
      this.horasResolucionTranscurridas = +(ms / (1000 * 60 * 60)).toFixed(2);
    }

    const ratio = this.horasResolucionSla > 0 ? (this.horasResolucionTranscurridas / this.horasResolucionSla) : 0;
    this.porcentajeResolucion = Math.max(0, Math.min(100, Math.round(ratio * 100)));
    this.resolucionVencida = this.horasResolucionTranscurridas > this.horasResolucionSla;

    // Offset circular
    const progressInterior = Math.min(1, Math.max(0.04, this.porcentajeResolucion / 100));
    this.offsetInterior = this.perimetroInterior * (1 - progressInterior);

    // Color semáforo Resolución
    if (this.resolucionVencida) {
      this.colorInterior = '#EF4444'; // Rojo / Vencido
      this.trackColorInterior = '#FEE2E2';
    } else if (this.porcentajeResolucion >= 70) {
      this.colorInterior = '#F59E0B'; // Ámbar / Alerta
      this.trackColorInterior = '#FEF3C7';
    } else {
      this.colorInterior = '#3B82F6'; // Azul vibrante / En tiempo
      this.trackColorInterior = '#EFF6FF';
    }
  }

  private buscarSubcategoriaRecursiva(subcategorias: any[], idBuscado: string): any | null {
    if (!subcategorias || !subcategorias.length) return null;
    for (const sub of subcategorias) {
      if (String(sub.id) === idBuscado) return sub;
      if (sub.subcategorias && sub.subcategorias.length > 0) {
        const found = this.buscarSubcategoriaRecursiva(sub.subcategorias, idBuscado);
        if (found) return found;
      }
    }
    return null;
  }

  formatearHorasLegible(horas: number, tiempoOriginal?: number, unidadOriginal?: 'm' | 'h' | 'd'): string {
    if (unidadOriginal === 'm' && tiempoOriginal) {
      return `${tiempoOriginal}m`;
    }
    if (horas < 1) {
      const min = Math.round(horas * 60);
      return `${min}m (${horas}h)`;
    }
    if (horas >= 24 && horas % 24 === 0) {
      const dias = horas / 24;
      return `${horas}h (${dias}d)`;
    }
    return `${horas}h`;
  }

  private generarTooltip(): void {
    const estadoUrg = this.urgenciaVencida
      ? '⚠️'
      : (this.urgenciaAtendida ? '✅ Atendido' : '⏱ En curso');

    const estadoRes = !this.resolucionIniciada
      ? '⏳ Pendiente (Sin atender)'
      : (this.resolucionVencida
        ? '⚠️'
        : (this.resolucionCompletada ? '✅ Resuelto' : '⏱ En curso'));

    const metaResStr = this.formatearHorasLegible(this.horasResolucionSla, this.tiempoResolucionOriginal, this.unidadResolucionOriginal);
    const transResStr = this.formatearHorasLegible(this.horasResolucionTranscurridas);

    const detalleUrg = `${estadoUrg}⭕ [TA] ${this.horasUrgenciaTranscurridas}h / ${this.horasUrgenciaSla}h`;
    const detalleRes = `${estadoRes}🎯 [TR] ${transResStr} / ${metaResStr}`;

    this.tooltipTexto = `${detalleUrg}\n${detalleRes}`;
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
