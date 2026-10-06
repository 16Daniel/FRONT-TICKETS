import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule, UIChart } from 'primeng/chart';

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

  @ViewChild('chart') chart!: UIChart;

  chartData: any;
  chartOptions: any;

  constructor() {
    this.initOptions();
  }

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

  private initOptions() {
    this.chartOptions = {
      plugins: {
        legend: { display: false }
      },
      scales: {
        r: {
          angleLines: { display: true },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: { stepSize: 20 }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }

  private updateChart() {
    const rawData = this.activeData;
    
    // Si la data viene vacía o no tiene el formato esperado, ponemos default
    if (!rawData || rawData.length === 0 || !rawData[0].series) {
      if (!this.chartData) {
        this.chartData = { labels: [], datasets: [] };
      } else {
        this.chartData.datasets = [];
        if (this.chart) this.chart.refresh();
      }
      return;
    }

    const series = rawData[0].series;
    const labels = series.map((item: any) => item.name);
    const dataValues = series.map((item: any) => item.value);

    // Color base corporativo Rebel Wings (por defecto si no hay colorScheme)
    const rgbaBg = 'rgba(211, 21, 42, 0.4)';
    const rgbaBorder = 'rgba(211, 21, 42, 1)';

    if (!this.chartData) {
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
    } else {
      // Mutate existing object to prevent canvas destruction
      this.chartData.labels = labels;
      if (!this.chartData.datasets || this.chartData.datasets.length === 0) {
        this.chartData.datasets = [{
            label: this.currentTitle,
            backgroundColor: rgbaBg,
            borderColor: rgbaBorder,
            pointBackgroundColor: rgbaBorder,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: rgbaBorder,
            data: dataValues
        }];
      } else {
        this.chartData.datasets[0].data = dataValues;
        this.chartData.datasets[0].label = this.currentTitle;
      }
      
      if (this.chart) {
        this.chart.refresh();
      }
    }
  }
}
