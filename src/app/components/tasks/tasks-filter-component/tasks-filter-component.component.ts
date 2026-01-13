import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { ModalArchivedTasksComponent } from '../../../modals/tasks/modal-archived-tasks/modal-archived-tasks.component';
import { ModalTaskResponsibleComponent } from '../../../modals/tasks/modal-task-responsible/modal-task-responsible.component';
import { ModalLabelsTaskComponent } from '../../../modals/tasks/modal-labels-task/modal-labels-task.component';
import { NewTaskComponent } from '../../../modals/tasks/modal-new-task/new-task.component';
import { TaskResponsibleService } from '../../../services/task-responsible.service';
import { ResponsableTarea } from '../../../models/responsable-tarea.model';

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
    NewTaskComponent,
    MultiSelectModule
  ],
  templateUrl: './tasks-filter-component.component.html',
  styleUrl: './tasks-filter-component.component.scss'
})
export class TasksFilterComponentComponent {

  @Input() sucursales: any[] = [];
  @Input() etiquetas: any[] = [];

  @Input() idSucursalSeleccionada!: string;
  idEtiquetaSeleccionada!: string;
  idResponsableSeleccionado!: string;
  idsResponsablesGlobalesSeleccionados: string[] = [];

  @Input() sucursalSeleccionadaNombre?: string;

  @Output() esGlobal = new EventEmitter<boolean>();
  @Output() textoBusquedaChange = new EventEmitter<string>();
  @Output() sucursalChange = new EventEmitter<string>();
  @Output() etiquetaChange = new EventEmitter<string>();
  @Output() responsableChange = new EventEmitter<string>();
  @Output() responsablesGlobalesChange = new EventEmitter<string[]>();

  mostrarFiltrosGlobales = false;

  responsables: ResponsableTarea[] = [];

  mostrarModalEtiquetas = false;
  mostrarModalResponsables = false;
  mostrarModalArchivados = false;
  mostrarModalNuevaTarea = false;

  textoBusqueda?: string;

  constructor(private taskResponsibleService: TaskResponsibleService) { }

  ngOnInit(): void {
    this.taskResponsibleService.responsables$.subscribe(() => {
      this.actualizarResponsables();
    });
  }

  onToggleModo(global: boolean): void {
    this.mostrarFiltrosGlobales = global;

    // if (global)
    //   this.sucursalChange.emit(undefined as any)

    this.esGlobal.emit(global);
    this.responsableChange.emit(undefined as any);
    this.responsablesGlobalesChange.emit([]);

    this.actualizarResponsables();
  }

  onSucursalChange(): void {
    this.sucursalChange.emit(this.idSucursalSeleccionada);
    this.idResponsableSeleccionado = undefined!;
    this.responsableChange.emit(undefined as any);
    this.actualizarResponsables();
  }

  private actualizarResponsables(): void {
    this.responsables = this.mostrarFiltrosGlobales
      ? this.taskResponsibleService.filtrarGlobales()
      : this.taskResponsibleService.filtrarPorSucursal(this.idSucursalSeleccionada);
  }

  onResponsableChange(id: string | null): void {
    this.responsableChange.emit(id ?? undefined as any);
  }

  onResponsablesGlobalesChange(ids: string[]): void {
    this.responsablesGlobalesChange.emit(ids);
  }

  onBuscarText() {
    this.textoBusquedaChange.emit(this.textoBusqueda);
  }
}

