import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { UmbralRadarChartComponent } from '../umbral-radar-chart/umbral-radar-chart.component';
import { Ticket } from '../../interfaces/ticket.model';
import { MatrizUrgencia } from '../../../categorias/interfaces/matriz-urgencia.interface';
import { KpiFiltro, KpiRadarService, KPI_FILTRO_TITULOS } from '../../services/kpi-radar.service';
import { TarjetasMedidoresKpisComponent } from '../tarjetas-medidores-kpis/tarjetas-medidores-kpis.component';
import { ListaTicketsKpisComponent } from '../lista-tickets-kpis/lista-tickets-kpis.component';

@Component({
  selector: 'app-grafica-desempeno-categorias',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, UmbralRadarChartComponent, TarjetasMedidoresKpisComponent, ListaTicketsKpisComponent],
  templateUrl: './grafica-desempeno-categorias.component.html',
  styleUrl: './grafica-desempeno-categorias.component.scss'
})
export class GraficaDesempenoCategoriasComponent implements OnChanges {
  @Input() tickets: Ticket[] = [];
  @Input() sucursales: any[] = [];
  @Input() matrizUrgencia: MatrizUrgencia | undefined;
  @Input() colorScheme: any;

  datosBarras: any[] = [];
  radarDataGeneral: any[] = [];
  radarDataCategorias: { [name: string]: any[] } = {};
  
  selectedRadarItem: string = '';

  totalesDirectivos = {
    totalTickets: 0,
    totalTerminados: 0,
    terminadosPorcentaje: 0,
    slaAtencion: 0,
    slaResolucion: 0
  };

  constructor(private radarService: KpiRadarService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tickets'] || changes['matrizUrgencia']) {
      this.procesarDatos();
    }
  }

  private procesarDatos(): void {
    if (!this.tickets) return;

    // Calcular tickets por categoría para barras
    const nameCounts: { [name: string]: number } = {};
    
    this.tickets.forEach(t => {
      const catName = t.nombreSubcategoria || t.nombreCategoria || 'Sin Categoría';
      nameCounts[catName] = (nameCounts[catName] || 0) + 1;
    });

    this.datosBarras = Object.keys(nameCounts).map(name => ({
      name: name,
      value: nameCounts[name]
    })).sort((a, b) => b.value - a.value);

    // Calcular radar
    const radarResult = this.radarService.procesarRadarCategorias(this.tickets, this.matrizUrgencia);
    this.radarDataGeneral = radarResult.general;
    this.radarDataCategorias = radarResult.diccionario;

    this.actualizarTotales();
  }

  private actualizarTotales(): void {
    const data = this.selectedRadarItem && this.radarDataCategorias[this.selectedRadarItem]
      ? this.radarDataCategorias[this.selectedRadarItem]
      : this.radarDataGeneral;

    this.aplicarFiltroKpi();
    if (!data || data.length === 0) return;
    const rawStats = data[0].rawStats;
    
    if (rawStats) {
      this.totalesDirectivos = {
        totalTickets: rawStats.totalTickets,
        totalTerminados: rawStats.totalTerminados,
        terminadosPorcentaje: rawStats.totalTickets > 0 ? (rawStats.totalTerminados / rawStats.totalTickets) * 100 : 0,
        slaAtencion: rawStats.totalTerminados > 0 ? (rawStats.slaAtencionMet / rawStats.totalTerminados) * 100 : 0,
        slaResolucion: rawStats.totalTerminados > 0 ? (rawStats.slaResolucionMet / rawStats.totalTerminados) * 100 : 0
      };
    }
  }

  get reversedDatosBarras() {
    return this.datosBarras;
  }

  getChartHeight(): string {
    const minHeight = 300;
    const itemHeight = 35;
    const calculatedHeight = (this.datosBarras.length * itemHeight) + 50;
    return `${Math.max(minHeight, calculatedHeight)}px`;
  }

  onSelect(event: any): void {
    if (typeof event === 'object' && event.name) {
      this.selectedRadarItem = this.selectedRadarItem === event.name ? '' : event.name;
      
      if (this.selectedRadarItem && this.radarDataCategorias[this.selectedRadarItem]) {
        const rawData = this.radarDataCategorias[this.selectedRadarItem][0];
        if (rawData && rawData.detalles) {
          console.group(`=== TICKETS DE CATEGORÍA: ${event.name} ===`);
          console.table(rawData.detalles);
          console.groupEnd();
        }
      }
      this.actualizarTotales();
    }
  }

  filtroKpi: KpiFiltro | null = null;
  ticketsKpi: Ticket[] = [];

  get tituloKpi(): string {
    return this.filtroKpi ? KPI_FILTRO_TITULOS[this.filtroKpi] : '';
  }

  onFiltroKpi(filtro: KpiFiltro | null): void {
    this.filtroKpi = filtro;
    this.aplicarFiltroKpi();
  }

  private aplicarFiltroKpi(): void {
    if (!this.filtroKpi || !this.tickets) {
      this.ticketsKpi = [];
      return;
    }
    let base = this.tickets;
    if (this.selectedRadarItem) {
      base = base.filter(t =>
        t.nombreCategoria === this.selectedRadarItem ||
        t.nombreSubcategoria === this.selectedRadarItem
      );
    }
    this.ticketsKpi = this.radarService.filtrarPorKpi(base, this.filtroKpi, this.matrizUrgencia);
  }

  private extraerFechaStr(fechaRaw: any): Date | null {
    if (!fechaRaw) return null;
    try {
      if (fechaRaw.toDate && typeof fechaRaw.toDate === 'function') {
        return fechaRaw.toDate();
      }
      return new Date(fechaRaw);
    } catch {
      return null;
    }
  }
}
