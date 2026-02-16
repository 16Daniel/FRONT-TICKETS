import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

import { TaskCardComponent } from '../task-card/task-card.component';
import { Tarea } from '../../interfaces/tarea.interface';

@Component({
  selector: 'app-tasks-board',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    TaskCardComponent,
  ],
  templateUrl: './tasks-board.component.html',
  styleUrl: './tasks-board.component.scss'
})
export class TasksBoardComponent {

  /** Datos */
  @Input() toDo: Tarea[] = [];
  @Input() working: Tarea[] = [];
  @Input() check: Tarea[] = [];
  @Input() done: Tarea[] = [];

  @Input() sucursalesMap = new Map<string, string>();
  @Input() idSucursalSeleccionada!: string;
  @Input() textoBusqueda!: string;

  @Input() mostrarProyectos: boolean = false;

  /** Eventos */
  @Output() dropTask = new EventEmitter<CdkDragDrop<Tarea[]>>();
  @Output() seleccionarTarea = new EventEmitter<Tarea>();

  dropListIds = ['todoList', 'workingList', 'checkList', 'doneList'];

  onDrop(event: CdkDragDrop<Tarea[]>) {
    this.dropTask.emit(event);
  }

  onSeleccionar(tarea: Tarea) {
    this.seleccionarTarea.emit(tarea);
  }

  filtrarTareasProyectos(tareas: Tarea[]) {
    return this.mostrarProyectos ? this.filtrarProyectos(tareas) : this.filtrarTareas(tareas);
  }

  private filtrarTareas(tareas: Tarea[]): Tarea[] {
    return tareas.filter(x => (x.esProyecto == false || x.esProyecto == undefined));
  }

  private filtrarProyectos(tareas: Tarea[]): Tarea[] {
    return tareas.filter(x => (x.esProyecto == true || x.esProyecto == undefined));
  }
}
