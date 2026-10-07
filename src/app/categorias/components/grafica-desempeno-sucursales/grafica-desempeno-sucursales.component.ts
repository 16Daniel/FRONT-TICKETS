import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { UmbralRadarChartComponent } from '../umbral-radar-chart/umbral-radar-chart.component';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { MatrizUrgencia } from '../../interfaces/matriz-urgencia.interface';
import { UmbralRadarService } from '../../services/umbral-radar.service';

@Component({
  selector: 'app-grafica-desempeno-sucursales',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, UmbralRadarChartComponent],
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

  constructor(private radarService: UmbralRadarService) {}

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
      
      if (this.selectedRadarItem && this.radarDataSucursales[this.selectedRadarItem]) {
        const rawData = this.radarDataSucursales[this.selectedRadarItem][0];
        if (rawData && rawData.detalles) {
          console.group(`=== TICKETS DE SUCURSAL: ${event.name} ===`);
          console.table(rawData.detalles);
          console.groupEnd();
        }
      }
    }
  }
}
