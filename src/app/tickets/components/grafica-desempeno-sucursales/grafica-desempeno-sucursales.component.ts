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
  selector: 'app-grafica-desempeno-sucursales',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, UmbralRadarChartComponent, TarjetasMedidoresKpisComponent, ListaTicketsKpisComponent],
  templateUrl: './grafica-desempeno-sucursales.component.html',
  styleUrl: './grafica-desempeno-sucursales.component.scss'
})
export class GraficaDesempenoSucursalesComponent implements OnChanges {
  @Input() tickets: Ticket[] = [];
  @Input() sucursales: any[] = [];
  @Input() matrizUrgencia: MatrizUrgencia | undefined;
  @Input() colorScheme: any;

  datosBarras: any[] = [];
  radarDataGeneral: any[] = [];
  radarDataSucursales: { [name: string]: any[] } = {};
  
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
    if (changes['tickets'] || changes['sucursales'] || changes['matrizUrgencia']) {
      this.procesarDatos();
    }
  }

  private procesarDatos(): void {
    if (!this.tickets || !this.sucursales) return;

    // Calcular tickets por sucursal para barras
    const sucursalCounts: { [id: string]: number } = {};
    
    this.tickets.forEach(t => {
      if (t.idSucursal) {
        const sId = String(t.idSucursal);
        sucursalCounts[sId] = (sucursalCounts[sId] || 0) + 1;
      }
    });

    this.datosBarras = Object.keys(sucursalCounts).map(id => {
      const s = this.sucursales.find(x => String(x.id) === id);
      return {
        name: s ? s.nombre : `Sucursal ${id}`,
        value: sucursalCounts[id]
      };
    }).sort((a, b) => b.value - a.value);

    // Calcular radar
    const radarResult = this.radarService.procesarRadarSucursales(this.tickets, this.matrizUrgencia, this.sucursales);
    this.radarDataGeneral = radarResult.general;
    this.radarDataSucursales = radarResult.diccionario;

    this.actualizarTotales();
  }

  private actualizarTotales(): void {
    const data = this.selectedRadarItem && this.radarDataSucursales[this.selectedRadarItem]
      ? this.radarDataSucursales[this.selectedRadarItem]
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
      
      if (this.selectedRadarItem && this.radarDataSucursales[this.selectedRadarItem]) {
        const rawData = this.radarDataSucursales[this.selectedRadarItem][0];
        if (rawData && rawData.detalles) {
          console.group(`=== TICKETS DE SUCURSAL: ${event.name} ===`);
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
      const s = this.sucursales.find(x => x.nombre === this.selectedRadarItem);
      base = s ? base.filter(t => String(t.idSucursal) === String(s.id)) : [];
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
