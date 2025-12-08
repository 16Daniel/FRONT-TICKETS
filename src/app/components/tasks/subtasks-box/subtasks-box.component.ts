import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subtasks-box',
  standalone: true,
  imports: [CommonModule, FormsModule],

  templateUrl: './subtasks-box.component.html',
  styleUrl: './subtasks-box.component.scss'
})
export class SubtasksBoxComponent {

  @Input() tarea: any;
  @Input() mostrarSubtareas: boolean = false;

  @Output() subtareaAgregada = new EventEmitter<string>();

  nuevaSubtarea: string = '';

  agregarSubtarea() {
    if (!this.nuevaSubtarea.trim()) return;

    this.subtareaAgregada.emit(this.nuevaSubtarea);
    this.nuevaSubtarea = '';
  }

  eliminarSubtarea(index: number) {
    this.tarea.subtareas.splice(index, 1);
  }

  calcularProgreso(): number {
    if (!this.tarea.subtareas || this.tarea.subtareas.length === 0) return 0;

    const total = this.tarea.subtareas.length;
    const terminadas = this.tarea.subtareas.filter((s: any) => s.terminado).length;

    return Math.round((terminadas / total) * 100);
  }

  getProgressColor(): string {
    const porcentaje = this.calcularProgreso();

    if (porcentaje <= 30) return 'bg-danger';
    if (porcentaje <= 70) return 'bg-warning';

    return 'bg-success';
  }

}
