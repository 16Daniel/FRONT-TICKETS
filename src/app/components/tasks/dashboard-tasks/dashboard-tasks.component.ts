import { Component, Input, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';

import { NewTaskComponent } from '../../../modals/tasks/new-task/new-task.component';
import { TaskDetailComponent } from '../../../modals/tasks/task-detail/task-detail.component';
import { TaskCardComponent } from '../task-card/task-card.component';
import { Tarea } from '../../../models/tarea.model';
import { TareasService } from '../../../services/tareas.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-dashboard-tasks',
  standalone: true,
  imports: [
    DragDropModule,
    CommonModule,
    NewTaskComponent,
    TaskCardComponent,
    ToastModule,
    TaskDetailComponent
  ],
  templateUrl: './dashboard-tasks.component.html',
  styleUrl: './dashboard-tasks.component.scss'
})
export class DashboardTasksComponent implements OnInit {
  @Input() idSucursal!: string;
  mostrarModalDetalleTarea: boolean = false;

  constructor(
    private tareasService: TareasService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.initData();
  }

  dropListIds = ['todoList', 'workingList', 'checkList', 'doneList'];
  mostrarModalNuevaTarea = false;
  tareaSeleccionada!: Tarea;

  toDo: Tarea[] = [];
  working: Tarea[] = [];
  check: Tarea[] = [];
  done: Tarea[] = [];

  abrirModalAgregarTarea() {
    this.mostrarModalNuevaTarea = true;
  }

  async drop(event: CdkDragDrop<Tarea[]>) {
    console.log("ORIGEN:", event.previousContainer.id, event.previousContainer.data);
    console.log("DESTINO:", event.container.id, event.container.data);

    const tareaMovida = event.item.data as Tarea;
    console.log("TAREA MOVIDA:", tareaMovida);

    if (!tareaMovida) {
      console.warn("No se pudo obtener la tarea movida");
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    switch (event.container.id) {
      case 'todoList':
        tareaMovida.idEstatus = '1';
        break;
      case 'workingList':
        tareaMovida.idEstatus = '2';
        break;
      case 'checkList':
        tareaMovida.idEstatus = '3';
        break;
      case 'doneList':
        tareaMovida.idEstatus = '4';
        break;

    }

    await this.tareasService.update(tareaMovida, tareaMovida.id!);
    this.showMessage('success', 'Success', 'Enviado correctamente');
  }


  initData() {
    this.tareasService.getBySucursal(this.idSucursal).subscribe((tareas: Tarea[]) => {
      console.log(tareas)
      this.toDo = tareas.filter(x => x.idEstatus == '1');
      this.working = tareas.filter(x => x.idEstatus == '2');
      this.check = tareas.filter(x => x.idEstatus == '3');
      this.done = tareas.filter(x => x.idEstatus == '4');
    })
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  abrirDetalle(tarea: Tarea) {
    this.tareaSeleccionada = { ...tarea };
    this.mostrarModalDetalleTarea = true;
  }
}
