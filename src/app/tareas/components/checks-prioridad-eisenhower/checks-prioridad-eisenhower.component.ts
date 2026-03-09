import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ControlContainer, FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-checks-prioridad-eisenhower',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './checks-prioridad-eisenhower.component.html',
  styleUrl: './checks-prioridad-eisenhower.component.scss',
  viewProviders: [
    { provide: ControlContainer, useExisting: NgForm }
  ]
})
export class ChecksPrioridadEinsehowerComponent {
  @Input() modelo: any = {
    urgente: null,
    importante: null
  };

  @Output() cambio = new EventEmitter<any>();

  emitirCambio() {
    const urgente = this.modelo.urgente;
    const importante = this.modelo.importante;

    let idEisenhower = null;

    if (urgente && importante) {
      if (urgente === 'URGENTE' && importante === 'IMPORTANTE') idEisenhower = '1';
      if (urgente === 'NO URGENTE' && importante === 'IMPORTANTE') idEisenhower = '2';
      if (urgente === 'URGENTE' && importante === 'NO IMPORTANTE') idEisenhower = '3';
      if (urgente === 'NO URGENTE' && importante === 'NO IMPORTANTE') idEisenhower = '4';
    }

    this.cambio.emit({
      ...this.modelo,
      idEisenhower
    });
  }
}
