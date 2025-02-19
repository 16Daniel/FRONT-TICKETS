import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
})
export class ProgressBarComponent {
  @Input() progreso: number = 0;

  incrementarProgreso(valor: number) {
    this.progreso += valor;
    if (this.progreso > 100) {
      this.progreso = 100;
    }
  }
}
