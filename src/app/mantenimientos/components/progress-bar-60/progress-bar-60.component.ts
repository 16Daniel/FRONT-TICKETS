import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar-60',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar-60.component.html',
  styleUrl: './progress-bar-60.component.scss'
})
export class ProgressBar60Component {
  @Input() progreso: number = 0;

  incrementarProgreso(valor: number) {
    this.progreso += valor;
    if (this.progreso > 100) {
      this.progreso = 100;
    }
  }
}
