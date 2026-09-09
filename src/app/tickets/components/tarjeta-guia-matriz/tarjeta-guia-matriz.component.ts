import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CUADRANTES } from '../../helpers/matriz-criticidad.helper';

@Component({
  selector: 'app-tarjeta-guia-matriz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta-guia-matriz.component.html',
  styleUrl: './tarjeta-guia-matriz.component.scss'
})
export class TarjetaGuiaMatrizComponent {
  @Input() mostrar: boolean = false;
  @Output() cerrar = new EventEmitter<void>();

  readonly CUADRANTES = CUADRANTES;
}
