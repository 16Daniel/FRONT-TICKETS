import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { UmbralRadarChartComponent } from '../umbral-radar-chart/umbral-radar-chart.component';

@Component({
  selector: 'app-umbral-graficas',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, UmbralRadarChartComponent],
  templateUrl: './umbral-graficas.component.html',
  styleUrl: './umbral-graficas.component.scss'
})
export class UmbralGraficasComponent {
  @Input() datosCategorias: any[] = [];
  @Input() datosSucursales: any[] = [];
  @Input() radarDataGeneral: any[] = [];
  @Input() radarDataCategorias: { [name: string]: any[] } = {};
  @Input() radarDataSucursales: { [name: string]: any[] } = {};
  @Input() colorScheme: any;
  @Input() isApplyingFilters: boolean = false;

  selectedCategoriaRadar: string = '';
  selectedSucursalRadar: string = '';

  get reversedDatosCategorias() {
    return [...this.datosCategorias].reverse();
  }

  get reversedDatosSucursales() {
    return [...this.datosSucursales].reverse();
  }


  getChartHeight(datos: any[]): string {
    const minHeight = 300;
    const itemHeight = 35; // Píxeles por barra
    const calculatedHeight = (datos.length * itemHeight) + 50; // +50 para las etiquetas del eje X
    return `${Math.max(minHeight, calculatedHeight)}px`;
  }

  onSelectCategoria(event: any): void {
    if (typeof event === 'object' && event.name) {
      this.selectedCategoriaRadar = this.selectedCategoriaRadar === event.name ? '' : event.name;
    }
  }

  onSelectSucursal(event: any): void {
    if (typeof event === 'object' && event.name) {
      this.selectedSucursalRadar = this.selectedSucursalRadar === event.name ? '' : event.name;
    }
  }
}
