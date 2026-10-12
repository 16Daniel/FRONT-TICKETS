import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { UmbralRadarChartComponent } from '../umbral-radar-chart/umbral-radar-chart.component';
import { Ticket } from '../../interfaces/ticket.model';
import { MatrizUrgencia } from '../../../categorias/interfaces/matriz-urgencia.interface';
import { KpiRadarService } from '../../services/kpi-radar.service';
import { ExecutiveKpiFooterComponent } from '../executive-kpi-footer/executive-kpi-footer.component';
import { PendingTicketsListComponent } from '../pending-tickets-list/pending-tickets-list.component';

@Component({
  selector: 'app-grafica-desempeno-categorias',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, UmbralRadarChartComponent, ExecutiveKpiFooterComponent, PendingTicketsListComponent],
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
    return [...this.datosBarras].reverse();
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

  get pendingTicketsList(): Ticket[] {
    if (!this.tickets) return [];
    
    let pending = this.tickets.filter(t => String(t.idEstatusTicket) !== '3');
    
    if (this.selectedRadarItem) {
      pending = pending.filter(t => 
        t.nombreCategoria === this.selectedRadarItem || 
        t.nombreSubcategoria === this.selectedRadarItem
      );
    }

    return pending.sort((a, b) => {
       const da = this.extraerFechaStr(a.fecha)?.getTime() || 0;
       const db = this.extraerFechaStr(b.fecha)?.getTime() || 0;
       return da - db;
    });
  }

  get closedTicketsWithSlaIssuesList(): Ticket[] {
    if (!this.tickets) return [];
    
    let closed = this.tickets.filter(t => String(t.idEstatusTicket) === '3');
    closed = closed.filter(t => this.radarService.ticketTuvoProblemaSla(t, this.matrizUrgencia));
    
    if (this.selectedRadarItem) {
      closed = closed.filter(t => 
        t.nombreCategoria === this.selectedRadarItem || 
        t.nombreSubcategoria === this.selectedRadarItem
      );
    }

    return closed.sort((a, b) => {
       const da = this.extraerFechaStr(a.fecha)?.getTime() || 0;
       const db = this.extraerFechaStr(b.fecha)?.getTime() || 0;
       return da - db;
    });
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
