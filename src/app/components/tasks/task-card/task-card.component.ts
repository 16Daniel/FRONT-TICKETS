import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tarea } from '../../../models/tarea.model';
import { CommonModule } from '@angular/common';
import { TaskDetailComponent } from '../../../modals/tasks/task-detail/task-detail.component';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, TaskDetailComponent],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss'
})
export class TaskCardComponent {
  @Input() tarea!: Tarea;
  mostrarModalDetalleTarea = false;

  onClick() {
    console.log('Tarea seleccionada:', this.tarea);
    this.mostrarModalDetalleTarea = true;
  }
}
