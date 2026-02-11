import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskCardComponent } from '../task-card/task-card.component';
import { Tarea } from '../../interfaces/tarea.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects-board',
  standalone: true,
  imports: [TaskCardComponent, CommonModule],
  templateUrl: './projects-board.component.html',
  styleUrl: './projects-board.component.scss'
})
export class ProjectsBoardComponent {
  @Input() tareas: Tarea[] = [];
  @Input() sucursalesMap = new Map<string, string>();
  @Input() idSucursalSeleccionada!: string;

  @Output() seleccionarTarea = new EventEmitter<Tarea>();

  constructor() {
    console.log(this.tareas);
  }

  onSeleccionar(tarea: Tarea) {
    this.seleccionarTarea.emit(tarea);
  }
}
