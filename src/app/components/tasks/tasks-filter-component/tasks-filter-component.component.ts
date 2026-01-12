import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ModalArchivedTasksComponent } from '../../../modals/tasks/modal-archived-tasks/modal-archived-tasks.component';
import { ModalTaskResponsibleComponent } from '../../../modals/tasks/modal-task-responsible/modal-task-responsible.component';
import { ModalLabelsTaskComponent } from '../../../modals/tasks/modal-labels-task/modal-labels-task.component';
import { NewTaskComponent } from '../../../modals/tasks/modal-new-task/new-task.component';

@Component({
  selector: 'app-tasks-filter-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    ButtonModule,
    ModalTaskResponsibleComponent,
    ModalArchivedTasksComponent,
    ModalLabelsTaskComponent,
    NewTaskComponent
  ],
  templateUrl: './tasks-filter-component.component.html',
  styleUrl: './tasks-filter-component.component.scss'
})
export class TasksFilterComponentComponent {

  @Input() sucursales: any[] = [];
  @Input() etiquetas: any[] = [];
  @Input() responsables: any[] = [];

  @Input() idSucursalSeleccionada!: string;
  @Input() etiquetaSeleccionada!: string;
  @Input() responsableSeleccionado!: string;

  @Output() sucursalChange = new EventEmitter<string>();
  @Output() etiquetaChange = new EventEmitter<string>();
  @Output() responsableChange = new EventEmitter<string>();

  @Input() sucursalSeleccionadaNombre?: string;

  mostrarFiltrosGlobales: boolean = false;

  mostrarModalEtiquetas: boolean = false;
  mostrarModalResponsables: boolean = false;
  mostrarModalArchivados: boolean = false;
  mostrarModalNuevaTarea = false;
}
