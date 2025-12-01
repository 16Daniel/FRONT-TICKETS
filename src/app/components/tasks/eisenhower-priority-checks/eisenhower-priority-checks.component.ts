import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-eisenhower-priority-checks',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './eisenhower-priority-checks.component.html',
  styleUrl: './eisenhower-priority-checks.component.scss'
})
export class EisenhowerPriorityChecksComponent {
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
