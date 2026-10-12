import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Ticket } from '../../../tickets/interfaces/ticket.model';

@Component({
  selector: 'app-umbral-top-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './umbral-top-chart.component.html',
  styleUrl: './umbral-top-chart.component.scss'
})
export class UmbralTopChartComponent implements OnChanges {
  @Input() tickets: Ticket[] = [];
  @Input() topN: number = 10;
  @Input() umbralAlerta: number = 5;
  
  datosBarras: any[] = [];
  maxVal: number = 0;
  colorScheme: any = {
    domain: ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffe4e6']
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tickets'] || changes['topN'] || changes['umbralAlerta']) {
      this.procesarDatos();
    }
  }

  customColors = (name: string): string => {
    const bar = this.datosBarras.find(b => b.name === name);
    if (bar && bar.value >= this.umbralAlerta) {
      return '#d3152a'; // Rojo principal de diseño
    }
    return '#cbd5e1'; // Gris plano
  };

  private procesarDatos(): void {
    if (!this.tickets) return;

    const nameCounts: { [name: string]: number } = {};
    
    this.tickets.forEach(t => {
      const catName = t.nombreSubcategoria || t.nombreCategoria || 'Sin Categoría';
      nameCounts[catName] = (nameCounts[catName] || 0) + 1;
    });

    this.datosBarras = Object.keys(nameCounts)
      .map(name => ({
        name: name,
        value: nameCounts[name]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, this.topN);
      
    // Revertir para que el mayor quede arriba en la gráfica horizontal
    this.datosBarras = this.datosBarras.reverse();

    if (this.datosBarras.length > 0) {
      this.maxVal = Math.max(...this.datosBarras.map(d => d.value));
    } else {
      this.maxVal = 0;
    }
  }

  getChartHeight(): string {
    const minHeight = 250;
    const itemHeight = 40;
    const calculatedHeight = (this.datosBarras.length * itemHeight) + 60;
    return `${Math.max(minHeight, calculatedHeight)}px`;
  }
}
