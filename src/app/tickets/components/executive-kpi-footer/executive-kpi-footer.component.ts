import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TotalesDirectivos {
  totalTickets: number;
  totalTerminados: number;
  terminadosPorcentaje: number;
  slaAtencion: number;
  slaResolucion: number;
}

@Component({
  selector: 'app-executive-kpi-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './executive-kpi-footer.component.html',
  styleUrl: './executive-kpi-footer.component.scss'
})
export class ExecutiveKpiFooterComponent {
  @Input() totales: TotalesDirectivos = {
    totalTickets: 0,
    totalTerminados: 0,
    terminadosPorcentaje: 0,
    slaAtencion: 0,
    slaResolucion: 0
  };

  getSlaClass(value: number): string {
    if (value >= 90) return 'text-success bg-light-success';
    if (value >= 75) return 'text-warning bg-light-warning';
    return 'text-danger bg-light-danger';
  }

  getGradientId(value: number): string {
    if (value >= 90) return 'grad-success';
    if (value >= 75) return 'grad-warning';
    return 'grad-danger';
  }

  getSpeedometerOffset(value: number): number {
    const clamped = Math.max(0, Math.min(100, value));
    const circumference = 125.66;
    return circumference - (circumference * clamped / 100);
  }
}
