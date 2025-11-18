import { Component } from '@angular/core';
import { Task } from '../../models/task.model';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewTaskComponent } from '../../modals/tasks/new-task/new-task.component';

@Component({
  selector: 'app-dashboard-tasks',
  standalone: true,
  imports: [DragDropModule, CommonModule, FormsModule, NewTaskComponent],
  templateUrl: './dashboard-tasks.component.html',
  styleUrl: './dashboard-tasks.component.scss'
})
export class DashboardTasksComponent {
  dropListIds = ['todoList', 'workingList', 'pauseList', 'doneList'];
  mostrarModalTarea: boolean = true;

  toDo: Task[] = [
    { id: '1', titulo: 'Tarea 1' },
    { id: '2', titulo: 'Tarea 2' }
  ];

  working: Task[] = [
    { id: '3', titulo: 'Tarea en progreso' }
  ];

  pause: Task[] = [];

  done: Task[] = [
    { id: '4', titulo: 'Tarea terminada' }
  ];

  agregarTarea() {
    this.mostrarModalTarea = true;
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
}
