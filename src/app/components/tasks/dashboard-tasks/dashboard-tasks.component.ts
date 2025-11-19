import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

import { NewTaskComponent } from '../../../modals/tasks/new-task/new-task.component';
import { TaskDetailComponent } from '../../../modals/tasks/task-detail/task-detail.component';
import { TaskCardComponent } from '../task-card/task-card.component';
import { Tarea } from '../../../models/tarea.model';

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
export class DashboardTasksComponent {

  dropListIds = ['todoList', 'workingList', 'pauseList', 'doneList'];

  mostrarModalNuevaTarea = false;

  // Datos mock iniciales
  toDo: Tarea[] = [
    {
      id: '1',
      titulo: 'BAJAR LA CANTIDAD DE MERMAS',
      fecha: new Date(),
      fechaFin: null,
      idCategoria: '',
      idSucursal: '',
      comentariosGerencia: '',
      comentariosResponsable: '',
      idEstatus: 'todo',
      chat: [],
      evidenciaUrls: []
    },
    {
      id: '2',
      titulo: 'CONTROLAR LAS FALTAS EN SUCURSALES',
      fecha: new Date(),
      fechaFin: null,
      idCategoria: '',
      idSucursal: '',
      comentariosGerencia: '',
      comentariosResponsable: '',
      idEstatus: 'todo',
      chat: [],
      evidenciaUrls: []
    }
  ];

  working: Tarea[] = [
    {
      id: '3',
      titulo: '25 PUNTOS ESTA MUY ALTO',
      fecha: new Date(),
      fechaFin: null,
      idCategoria: '',
      idSucursal: '',
      comentariosGerencia: '',
      comentariosResponsable: '',
      idEstatus: 'working',
      chat: [],
      evidenciaUrls: []
    }
  ];

  pause: Tarea[] = [];

  done: Tarea[] = [
    {
      id: '4',
      titulo: 'Tarea terminada',
      fecha: new Date(),
      fechaFin: new Date(),
      idCategoria: '',
      idSucursal: '',
      comentariosGerencia: '',
      comentariosResponsable: '',
      idEstatus: 'done',
      chat: [],
      evidenciaUrls: []
    }
  ];

  abrirModalAgregarTarea() {
    this.mostrarModalNuevaTarea = true;
  }

  drop(event: CdkDragDrop<Tarea[]>) {
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
