import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tarea } from '../../../models/tarea.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss'
})
export class TaskCardComponent {
  @Input() tarea!: Tarea;
  @Output() clickTarea = new EventEmitter<Tarea>();

  onClick() {
    this.clickTarea.emit(this.tarea);
  }
}
