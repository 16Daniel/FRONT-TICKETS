import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { UmbralRadarChartComponent } from '../umbral-radar-chart/umbral-radar-chart.component';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { MatrizUrgencia } from '../../interfaces/matriz-urgencia.interface';
import { UmbralRadarService } from '../../services/umbral-radar.service';

@Component({
  selector: 'app-grafica-desempeno-responsables',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, UmbralRadarChartComponent],
  templateUrl: './grafica-desempeno-responsables.component.html',
  styleUrl: './grafica-desempeno-responsables.component.scss'
})
export class GraficaDesempenoResponsablesComponent implements OnChanges {
  @Input() tickets: Ticket[] = [];
  @Input() usuarios: any[] = [];
  @Input() matrizUrgencia: MatrizUrgencia | undefined;
  @Input() colorScheme: any;

  datosBarras: any[] = [];
  radarDataGeneral: any[] = [];
  radarDataUsuarios: { [name: string]: any[] } = {};
  
  selectedRadarItem: string = '';

  constructor(private radarService: UmbralRadarService) {}

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
}
