import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { UmbralRadarChartComponent } from '../umbral-radar-chart/umbral-radar-chart.component';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { MatrizUrgencia } from '../../interfaces/matriz-urgencia.interface';
import { UmbralRadarService } from '../../services/umbral-radar.service';

@Component({
  selector: 'app-grafica-desempeno-categorias',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, UmbralRadarChartComponent],
  templateUrl: './grafica-desempeno-categorias.component.html',
  styleUrl: './grafica-desempeno-categorias.component.scss'
})
export class GraficaDesempenoCategoriasComponent implements OnChanges {
  @Input() tickets: Ticket[] = [];
  @Input() matrizUrgencia: MatrizUrgencia | undefined;
  @Input() colorScheme: any;

  datosBarras: any[] = [];
  radarDataGeneral: any[] = [];
  radarDataCategorias: { [name: string]: any[] } = {};
  
  selectedRadarItem: string = '';

  constructor(private radarService: UmbralRadarService) {}

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
    }
  }
}
