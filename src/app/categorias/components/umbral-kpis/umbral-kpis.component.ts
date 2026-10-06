import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-umbral-kpis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './umbral-kpis.component.html',
  styleUrl: './umbral-kpis.component.scss'
})
export class UmbralKpisComponent {
  @Input() totalTickets: number = 0;
  @Input() categoriaTopTickets: { nombre: string, conteo: number } | null = null;
  @Input() usuarioTopTickets: { nombre: string, conteo: number } | null = null;
  @Input() sucursalTopTickets: { nombre: string, conteo: number } | null = null;
  @Input() isApplyingFilters: boolean = false;
}
