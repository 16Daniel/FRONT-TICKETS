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

  getSlaBadgeClass(value: number, totalTerminados: number): string {
    if (totalTerminados === 0) return 'badge-neutral';
    if (value >= 90) return 'badge-success';
    if (value >= 75) return 'badge-warning';
    return 'badge-danger';
  }

  getSlaBadgeText(value: number, totalTerminados: number): string {
    if (totalTerminados === 0) return 'Sin registros';
    if (value >= 90) return 'Excelente (≥90%)';
    if (value >= 75) return 'Aceptable (≥75%)';
    return 'Por mejorar (<75%)';
  }
}
