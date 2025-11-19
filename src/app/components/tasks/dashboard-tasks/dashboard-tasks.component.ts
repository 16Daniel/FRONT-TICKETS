import { Component, Input, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

import { NewTaskComponent } from '../../../modals/tasks/new-task/new-task.component';
import { TaskDetailComponent } from '../../../modals/tasks/task-detail/task-detail.component';
import { TaskCardComponent } from '../task-card/task-card.component';
import { Tarea } from '../../../models/tarea.model';
import { TareasService } from '../../../services/tareas.service';

@Component({
  selector: 'app-dashboard-tasks',
  standalone: true,
  imports: [
    DragDropModule,
    CommonModule,
    NewTaskComponent,
    TaskCardComponent,

  ],
  templateUrl: './dashboard-tasks.component.html',
  styleUrl: './dashboard-tasks.component.scss'
})
export class DashboardTasksComponent implements OnInit {
  @Input() idSucursal!: string;

  constructor(private tareasService: TareasService) { }

  ngOnInit(): void {
    this.initData();
  }

  dropListIds = ['todoList', 'workingList', 'doneList', 'pauseList'];
  mostrarModalNuevaTarea = false;

  toDo: Tarea[] = [];
  working: Tarea[] = [];
  pause: Tarea[] = [];
  done: Tarea[] = [];

  abrirModalAgregarTarea() {
    this.mostrarModalNuevaTarea = true;
  }

  drop(event: CdkDragDrop<Tarea[]>, idEstatus: string) {
    console.log(event)
    console.log(event.item.data)
    console.log(event.container.data)

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

  initData() {
    this.tareasService.getBySucursal(this.idSucursal).subscribe((tareas: Tarea[]) => {
      console.log(tareas)
      this.toDo = tareas.filter(x => x.idEstatus == '1');
      this.working = tareas.filter(x => x.idEstatus == '2');
      this.pause = tareas.filter(x => x.idEstatus == '3');
      this.done = tareas.filter(x => x.idEstatus == '4');
    })
  }
}
