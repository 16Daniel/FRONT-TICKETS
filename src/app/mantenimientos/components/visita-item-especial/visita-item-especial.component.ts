import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-visita-item-especial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visita-item-especial.component.html',
  styleUrl: './visita-item-especial.component.scss',
})
export class VisitaItemEspecialComponent {
  @Input({ required: true }) item!: { id: string; nombre: string };

  get esGuardia(): boolean {
    return this.item?.id === '-999';
  }
}
