import { Component, Input, OnChanges, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Subscription } from 'rxjs';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { ListaTicketsKpisComponent } from '../../../tickets/components/lista-tickets-kpis/lista-tickets-kpis.component';
import { TarjetaRendimientoSlaComponent, TotalesSlaDashboard } from '../../../tickets/components/tarjeta-rendimiento-sla/tarjeta-rendimiento-sla.component';
import { MatrizUrgenciaService } from '../../services/matriz-urgencia.service';
import { MatrizUrgencia } from '../../interfaces/matriz-urgencia.interface';
import { KpiRadarService } from '../../../tickets/services/kpi-radar.service';

@Component({
  selector: 'app-umbral-top-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, ListaTicketsKpisComponent, TarjetaRendimientoSlaComponent],
  templateUrl: './umbral-top-chart.component.html',
  styleUrl: './umbral-top-chart.component.scss'
})
export class UmbralTopChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tickets: Ticket[] = [];
  @Input() topN?: number;
  @Input() umbralAlerta: number = 5;
  @Input() sucursales: any[] = [];
  @Input() categorias: any[] = [];
  @Input() idArea?: string;
  @Input() matrizUrgencia?: MatrizUrgencia;
  
  datosBarras: any[] = [];
  maxVal: number = 0;
  colorScheme: any = {
    domain: ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffe4e6']
  };

  categoriaSeleccionada: string | null = null;
  ticketsCategoria: Ticket[] = [];

  totalesSlaCategoria: TotalesSlaDashboard = {
    totalTickets: 0,
    totalTerminados: 0,
    slaAtencion: 0,
    slaAtencionCumplidos: 0,
    slaResolucion: 0,
    slaResolucionCumplidos: 0
  };

  private subMatriz?: Subscription;
  matrizUrgenciaArea?: MatrizUrgencia;

  customColors: any = (name: string): string => this.obtenerColorBarra(name);

  constructor(
    private matrizUrgenciaService: MatrizUrgenciaService,
    private kpiRadarService: KpiRadarService
  ) {}

  ngOnInit(): void {
    this.cargarMatriz();
  }

  ngOnDestroy(): void {
    this.subMatriz?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tickets'] || changes['topN'] || changes['umbralAlerta']) {
      this.procesarDatos();
      if (this.categoriaSeleccionada) {
        this.filtrarTicketsCategoria();
      }
    }
    if (changes['idArea'] || changes['matrizUrgencia']) {
      this.cargarMatriz();
    }
  }

  private cargarMatriz(): void {
    if (this.matrizUrgencia) {
      this.matrizUrgenciaArea = this.matrizUrgencia;
      if (this.categoriaSeleccionada) {
        this.calcularSlaCategoria();
      }
      return;
    }
    this.subMatriz?.unsubscribe();
    this.subMatriz = this.matrizUrgenciaService.obtenerMatrizPorArea(this.idArea || '1').subscribe(m => {
      this.matrizUrgenciaArea = m;
      if (this.categoriaSeleccionada) {
        this.calcularSlaCategoria();
      }
    });
  }

  obtenerColorBarra(name: string): string {
    const bar = this.datosBarras.find(b => b.name === name);
    const esCritico = bar ? bar.value >= this.umbralAlerta : false;

    if (this.categoriaSeleccionada) {
      if (this.categoriaSeleccionada === name) {
        return esCritico ? '#d3152a' : '#2563eb';
      }
      return '#e2e8f0';
    }

    return esCritico ? '#d3152a' : '#cbd5e1';
  }

  private actualizarColores(): void {
    this.customColors = (name: string): string => this.obtenerColorBarra(name);
  }

  onSelect(event: any): void {
    const selectedName = typeof event === 'string' ? event : event?.name;
    if (!selectedName) return;

    if (this.categoriaSeleccionada === selectedName) {
      this.limpiarSeleccion();
    } else {
      this.categoriaSeleccionada = selectedName;
      this.filtrarTicketsCategoria();
      this.actualizarColores();

      setTimeout(() => {
        const el = document.getElementById('categoria-tickets-detalle-anchor');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  }

  limpiarSeleccion(): void {
    this.categoriaSeleccionada = null;
    this.ticketsCategoria = [];
    this.totalesSlaCategoria = {
      totalTickets: 0,
      totalTerminados: 0,
      slaAtencion: 0,
      slaAtencionCumplidos: 0,
      slaResolucion: 0,
      slaResolucionCumplidos: 0
    };
    this.actualizarColores();
  }

  private filtrarTicketsCategoria(): void {
    if (!this.categoriaSeleccionada || !this.tickets) {
      this.ticketsCategoria = [];
      this.totalesSlaCategoria = {
        totalTickets: 0,
        totalTerminados: 0,
        slaAtencion: 0,
        slaAtencionCumplidos: 0,
        slaResolucion: 0,
        slaResolucionCumplidos: 0
      };
      return;
    }
    this.ticketsCategoria = this.tickets.filter(t => {
      const catName = t.nombreSubcategoria || t.nombreCategoria || 'Sin Categoría';
      return catName === this.categoriaSeleccionada;
    });
    this.calcularSlaCategoria();
  }

  private calcularSlaCategoria(): void {
    const totalTickets = this.ticketsCategoria.length;
    const terminados = this.ticketsCategoria.filter(t => String(t.idEstatusTicket) === '3');
    const totalTerminados = terminados.length;

    let slaAtencionCumplidos = 0;
    let slaResolucionCumplidos = 0;

    terminados.forEach(t => {
      const evalSla = this.kpiRadarService.evaluarSlaTicket(t, this.matrizUrgenciaArea);
      if (evalSla.atencion) {
        slaAtencionCumplidos++;
      }
      if (evalSla.resolucion) {
        slaResolucionCumplidos++;
      }
    });

    const slaAtencion = totalTerminados > 0
      ? (slaAtencionCumplidos / totalTerminados) * 100
      : 0;

    const slaResolucion = totalTerminados > 0
      ? (slaResolucionCumplidos / totalTerminados) * 100
      : 0;

    this.totalesSlaCategoria = {
      totalTickets,
      totalTerminados,
      slaAtencion,
      slaAtencionCumplidos,
      slaResolucion,
      slaResolucionCumplidos
    };
  }

  private procesarDatos(): void {
    if (!this.tickets) return;

    const nameCounts: { [name: string]: number } = {};
    
    this.tickets.forEach(t => {
      const catName = t.nombreSubcategoria || t.nombreCategoria || 'Sin Categoría';
      nameCounts[catName] = (nameCounts[catName] || 0) + 1;
    });

    let items = Object.keys(nameCounts)
      .map(name => ({
        name: name,
        value: nameCounts[name]
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    if (this.topN && this.topN > 0) {
      items = items.slice(0, this.topN);
    }
      
    // Revertir para que el mayor quede arriba en la gráfica horizontal
    this.datosBarras = items.reverse();

    if (this.datosBarras.length > 0) {
      this.maxVal = Math.max(...this.datosBarras.map(d => d.value));
    } else {
      this.maxVal = 0;
    }

    this.actualizarColores();
  }

  getChartHeight(): string {
    const minHeight = 250;
    const itemHeight = this.datosBarras.length > 15 ? 32 : 38;
    const calculatedHeight = (this.datosBarras.length * itemHeight) + 60;
    return `${Math.max(minHeight, calculatedHeight)}px`;
  }
}
