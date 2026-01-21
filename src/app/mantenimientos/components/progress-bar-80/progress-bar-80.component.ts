import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar-80',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar-80.component.html',
  styleUrl: './progress-bar-80.component.scss'
})
export class ProgressBar80Component {
  @Input() progreso: number = 0;

  incrementarProgreso(valor: number) {
    this.progreso += valor;
    if (this.progreso > 100) {
      this.progreso = 100;
    }
  }
}
