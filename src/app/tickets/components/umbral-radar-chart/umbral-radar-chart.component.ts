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
      animation: {
        duration: 800,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 10,
          cornerRadius: 8
        }
      },
      layout: {
        padding: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          suggestedMin: 0,
          suggestedMax: 100,
          angleLines: {
            display: true,
            color: '#e2e8f0',
            lineWidth: 1
          },
          grid: {
            color: '#e2e8f0',
            circular: false,
            lineWidth: 1.5
          },
          ticks: {
            stepSize: 20,
            showLabelBackdrop: false,
            color: '#94a3b8',
            font: {
              size: 10,
              weight: '500'
            }
          },
          pointLabels: {
            color: '#1e293b',
            font: {
              size: 11,
              weight: 'bold'
            },
            padding: 2
          }
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
    const rgbaBg = 'rgba(211, 21, 42, 0.35)';
    const rgbaBorder = 'rgba(211, 21, 42, 1)';

    if (!this.chartData) {
      this.chartData = {
        labels: labels,
        datasets: [
          {
            label: this.currentTitle,
            backgroundColor: rgbaBg,
            borderColor: rgbaBorder,
            borderWidth: 2.5,
            pointBackgroundColor: rgbaBorder,
            pointBorderColor: '#fff',
            pointBorderWidth: 1.5,
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: rgbaBorder,
            pointRadius: 4,
            pointHoverRadius: 6,
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
            borderWidth: 2.5,
            pointBackgroundColor: rgbaBorder,
            pointBorderColor: '#fff',
            pointBorderWidth: 1.5,
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: rgbaBorder,
            pointRadius: 4,
            pointHoverRadius: 6,
            data: dataValues
        }];
      } else {
        this.chartData.datasets[0].data = dataValues;
        this.chartData.datasets[0].label = this.currentTitle;
        this.chartData.datasets[0].borderWidth = 2.5;
        this.chartData.datasets[0].pointRadius = 4;
        this.chartData.datasets[0].pointHoverRadius = 6;
      }
      
      const chartInstance = this.chart?.chart;
      if (chartInstance) {
        chartInstance.data.labels = labels;
        if (chartInstance.data.datasets && chartInstance.data.datasets.length > 0) {
          chartInstance.data.datasets[0].data = dataValues;
          chartInstance.data.datasets[0].label = this.currentTitle;
        }
        // Resetea a 0 y anima suavemente hacia los nuevos valores (efecto de llenado progresivo)
        chartInstance.reset();
        chartInstance.update();
      } else if (this.chart) {
        this.chart.refresh();
      }
    }
  }
}
