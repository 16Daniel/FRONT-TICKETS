import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TotalesSlaDashboard {
  totalTickets: number;
  totalTerminados: number;
  slaAtencion: number;
  slaAtencionCumplidos: number;
  slaResolucion: number;
  slaResolucionCumplidos: number;
}

export type TotalesSlaAnalista = TotalesSlaDashboard;

@Component({
  selector: 'app-tarjetas-sla-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjetas-sla-dashboard.component.html',
  styleUrl: './tarjetas-sla-dashboard.component.scss'
})
export class TarjetasSlaDashboardComponent {
  @Input() totales: TotalesSlaDashboard = {
    totalTickets: 0,
    totalTerminados: 0,
    slaAtencion: 0,
    slaAtencionCumplidos: 0,
    slaResolucion: 0,
    slaResolucionCumplidos: 0
  };

  @Input() loading: boolean = false;
  @Input() mesNombre: string = '';
  @Input() titulo: string = 'Tu rendimiento del mes';

  getSpeedometerOffset(value: number): number {
    const clamped = Math.max(0, Math.min(100, value || 0));
    const circumference = 125.66;
    return circumference - (circumference * clamped / 100);
  }

  getGradientId(value: number): string {
    if (value >= 90) return 'grad-sla-success';
    if (value >= 75) return 'grad-sla-warning';
    return 'grad-sla-danger';
  }

  getCalificacionPromedio(): number {
    if (!this.totales || this.totales.totalTerminados === 0) return 0;
    const promedioPorcentaje = ((this.totales.slaAtencion || 0) + (this.totales.slaResolucion || 0)) / 2;
    const calificacion = promedioPorcentaje / 10;
    return Math.max(0, Math.min(10, calificacion));
  }

  getCalificacionClass(): string {
    if (!this.totales || this.totales.totalTerminados === 0) return 'score-neutral';
    const cal = this.getCalificacionPromedio();
    if (cal >= 9.0) return 'score-success';
    if (cal >= 7.5) return 'score-warning';
    return 'score-danger';
  }
}
