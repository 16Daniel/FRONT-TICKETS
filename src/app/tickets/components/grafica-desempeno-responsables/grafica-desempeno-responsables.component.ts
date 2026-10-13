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
  selector: 'app-grafica-desempeno-responsables',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, UmbralRadarChartComponent, ExecutiveKpiFooterComponent, PendingTicketsListComponent],
  templateUrl: './grafica-desempeno-responsables.component.html',
  styleUrl: './grafica-desempeno-responsables.component.scss'
})
export class GraficaDesempenoResponsablesComponent implements OnChanges {
  @Input() tickets: Ticket[] = [];
  @Input() sucursales: any[] = [];
  @Input() usuarios: any[] = [];
  @Input() matrizUrgencia: MatrizUrgencia | undefined;
  @Input() colorScheme: any;

  datosBarras: any[] = [];
  radarDataGeneral: any[] = [];
  radarDataUsuarios: { [name: string]: any[] } = {};
  
  selectedRadarItem: string = '';

  constructor(private radarService: KpiRadarService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tickets'] || changes['usuarios'] || changes['matrizUrgencia']) {
      this.procesarDatos();
    }
  }

  private procesarDatos(): void {
    if (!this.tickets || !this.usuarios) return;

    // Calcular tickets por usuario para barras
    const userCounts: { [id: string]: number } = {};
    
    this.tickets.forEach(t => {
      if (t.idResponsable) {
        const isRol4 = this.usuarios.some(u => u.id === t.idResponsable);
        if (isRol4) {
          userCounts[t.idResponsable] = (userCounts[t.idResponsable] || 0) + 1;
        }
      }
    });

    this.datosBarras = Object.keys(userCounts).map(id => {
      const u = this.usuarios.find(x => x.id === id);
      return {
        name: u ? `${u.nombre} ${u.apellidoP}`.trim() : `Usuario ${id}`,
        value: userCounts[id]
      };
    }).sort((a, b) => b.value - a.value);

    // Calcular radar
    const radarResult = this.radarService.procesarRadarUsuarios(this.tickets, this.matrizUrgencia, this.usuarios);
    this.radarDataGeneral = radarResult.general;
    this.radarDataUsuarios = radarResult.diccionario;
    
    this.actualizarTotales();
  }

  get reversedDatosBarras() {
    return this.datosBarras;
  }

  totalesDirectivos = {
    totalTickets: 0,
    totalTerminados: 0,
    terminadosPorcentaje: 0,
    slaAtencion: 0,
    slaResolucion: 0
  };

  private actualizarTotales(): void {
    const data = this.selectedRadarItem && this.radarDataUsuarios[this.selectedRadarItem]
      ? this.radarDataUsuarios[this.selectedRadarItem]
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

  getChartHeight(): string {
    const minHeight = 300;
    const itemHeight = 35;
    const calculatedHeight = (this.datosBarras.length * itemHeight) + 50;
    return `${Math.max(minHeight, calculatedHeight)}px`;
  }

  onSelect(event: any): void {
    if (typeof event === 'object' && event.name) {
      this.selectedRadarItem = this.selectedRadarItem === event.name ? '' : event.name;
      
      this.actualizarTotales();

      if (this.selectedRadarItem && this.radarDataUsuarios[this.selectedRadarItem]) {
        const rawData = this.radarDataUsuarios[this.selectedRadarItem][0];
        if (rawData && rawData.detalles) {
          console.group(`=== TICKETS DE USUARIO: ${event.name} ===`);
          console.table(rawData.detalles);
          console.groupEnd();
        }
      }
    }
  }

  get pendingTicketsList(): Ticket[] {
    if (!this.tickets) return [];
    
    let pending = this.tickets.filter(t => String(t.idEstatusTicket) !== '3');
    
    if (this.selectedRadarItem) {
      const u = this.usuarios.find(user => {
         return `${user.nombre} ${user.apellidoP}`.trim() === this.selectedRadarItem;
      });
      if (u) {
        pending = pending.filter(t => t.idResponsable === u.id);
      } else {
        pending = [];
      }
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
      const u = this.usuarios.find(user => {
         return `${user.nombre} ${user.apellidoP}`.trim() === this.selectedRadarItem;
      });
      if (u) {
        closed = closed.filter(t => t.idResponsable === u.id);
      } else {
        closed = [];
      }
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
