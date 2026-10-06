import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-umbral-radar-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './umbral-radar-chart.component.html',
  styleUrl: './umbral-radar-chart.component.scss'
})
export class UmbralRadarChartComponent implements OnChanges {
  @Input() colorScheme: any;
  @Input() dataGeneral: any[] = [];
  @Input() dataDictionary: { [key: string]: any[] } = {};
  @Input() selectedItem: string = '';

  chartData: any;
  chartOptions: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedItem'] || changes['dataGeneral'] || changes['dataDictionary']) {
      this.updateChart();
    }
  }

  get activeData(): any[] {
    if (this.selectedItem && this.dataDictionary[this.selectedItem]) {
      return this.dataDictionary[this.selectedItem];
    }
    return this.dataGeneral;
  }

  get currentTitle(): string {
    return 'Análisis SLA: ' + (this.selectedItem || 'General');
  }

  private updateChart() {
    const rawData = this.activeData;
    
    // Si la data viene vacía o no tiene el formato esperado, ponemos default
    if (!rawData || rawData.length === 0 || !rawData[0].series) {
      this.chartData = { labels: [], datasets: [] };
      return;
    }

    const series = rawData[0].series;
    const labels = series.map((item: any) => item.name);
    const dataValues = series.map((item: any) => item.value);

    // Color base corporativo Rebel Wings (por defecto si no hay colorScheme)
    const rgbaBg = 'rgba(211, 21, 42, 0.4)';
    const rgbaBorder = 'rgba(211, 21, 42, 1)';

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: this.currentTitle,
          backgroundColor: rgbaBg,
          borderColor: rgbaBorder,
          pointBackgroundColor: rgbaBorder,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: rgbaBorder,
          data: dataValues
        }
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        r: {
          angleLines: {
            display: true
          },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: {
            stepSize: 20
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }
}
