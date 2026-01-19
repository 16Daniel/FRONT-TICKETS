import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { TaskCardComponent } from '../task-card/task-card.component';
import { Tarea } from '../../../models/tarea.model';
import { SearchFilterPipe } from '../../../pipes/search-filter.pipe';

@Component({
  selector: 'app-tasks-board',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    TaskCardComponent,
    SearchFilterPipe
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
}
