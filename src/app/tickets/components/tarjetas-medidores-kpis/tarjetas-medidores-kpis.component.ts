import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiFiltro } from '../../services/kpi-radar.service';

export interface TotalesDirectivos {
  totalTickets: number;
  totalTerminados: number;
  terminadosPorcentaje: number;
  slaAtencion: number;
  slaResolucion: number;
}

@Component({
  selector: 'app-tarjetas-medidores-kpis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjetas-medidores-kpis.component.html',
  styleUrl: './tarjetas-medidores-kpis.component.scss'
})
export class TarjetasMedidoresKpisComponent {
  @Input() totales: TotalesDirectivos = {
    totalTickets: 0,
    totalTerminados: 0,
    terminadosPorcentaje: 0,
    slaAtencion: 0,
    slaResolucion: 0
  };

  @Input() filtroActivo: KpiFiltro | null = null;
  @Output() filtroChange = new EventEmitter<KpiFiltro | null>();

  seleccionar(filtro: KpiFiltro): void {
    this.filtroChange.emit(this.filtroActivo === filtro ? null : filtro);
  }

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
