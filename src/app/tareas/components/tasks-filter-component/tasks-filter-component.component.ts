import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';

import { TaskResponsibleService } from '../../services/task-responsible.service';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.interface';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { TareasArchivadasDialogComponent } from '../../dialogs/tareas-archivadas-dialog/tareas-archivadas-dialog.component';
import { EtiquetasTareaDialogComponent } from '../../dialogs/etiquetas-tarea-dialog/etiquetas-tarea-dialog.component';
import { CrearTareaDialogComponent } from '../../dialogs/crear-tarea-dialog/crear-tarea-dialog.component';
import { ResponsablesTareasDialogComponent } from '../../dialogs/responsables-tareas-dialog/responsables-tareas-dialog.component';

@Component({
  selector: 'app-tasks-filter-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    ButtonModule,
    ResponsablesTareasDialogComponent,
    TareasArchivadasDialogComponent,
    EtiquetasTareaDialogComponent,
    CrearTareaDialogComponent,
    MultiSelectModule
  ],
  templateUrl: './tasks-filter-component.component.html',
  styleUrl: './tasks-filter-component.component.scss'
})
export class TasksFilterComponentComponent {
  @Input() sucursales: any[] = [];
  @Input() sucursalesMap = new Map<string, string>();
  @Input() etiquetas: any[] = [];
  @Input() sucursalSeleccionadaNombre?: string;
  @Input() idSucursalSeleccionada!: string;

  idEtiquetaSeleccionada!: string;
  idResponsableSeleccionado!: string;
  idsResponsablesGlobalesSeleccionados: string[] = [];
  textoBusqueda?: string;

  @Output() esGlobal = new EventEmitter<boolean>();
  @Output() textoBusquedaChange = new EventEmitter<string>();
  @Output() sucursalChange = new EventEmitter<string>();
  @Output() etiquetaChange = new EventEmitter<string>();
  @Output() responsableChange = new EventEmitter<string>();
  @Output() responsablesGlobalesChange = new EventEmitter<string[]>();
  @Output() verProyectosChange = new EventEmitter<boolean>();

  mostrarFiltrosGlobales = false;
  responsables: ResponsableTarea[] = [];
  responsablesGlobalesOrdenados: ResponsableTarea[] = [];
  mostrarResponsables: boolean = false;
  mostrarModalEtiquetas = false;
  mostrarModalResponsables = false;
  mostrarModalArchivados = false;
  mostrarModalNuevaTarea = false;
  mostrarProyectos = false;
  usuario!: Usuario;
  taskResponsibleService = inject(TaskResponsibleService);

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.mostrarResponsables = this.usuario.sucursales.filter(x => x.nombre === 'SISTEMAS').length > 0;

    this.taskResponsibleService.responsables$.subscribe(() => {
      this.actualizarResponsables();
    });
  }

  onToggleModo(global: boolean): void {

    if (global) {
      this.ordenarResponsablesGlobales();
    }

    this.idEtiquetaSeleccionada = '';
    this.idResponsableSeleccionado = '';
    this.idsResponsablesGlobalesSeleccionados = [];
    this.textoBusqueda = '';

    this.mostrarFiltrosGlobales = global;

    this.esGlobal.emit(global);
    this.responsableChange.emit(undefined as any);
    this.responsablesGlobalesChange.emit([]);
    this.textoBusquedaChange.emit(undefined as any);

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
    this.textoBusqueda = '';

    this.responsablesGlobalesChange.emit(ids);
  }

  onBuscarText() {
    if (this.idsResponsablesGlobalesSeleccionados.length > 0)
      this.idsResponsablesGlobalesSeleccionados = [];

    this.textoBusquedaChange.emit(this.textoBusqueda);
  }

  private ordenarResponsablesGlobales(): void {
    this.responsablesGlobalesOrdenados = [...this.responsables].sort((a, b) => {
      if (a.idSucursal === b.idSucursal) {
        return a.nombre.localeCompare(b.nombre);
      }
      return a.idSucursal.localeCompare(b.idSucursal);
    }).filter(x => x.esGlobal);
  }

  onToggleProyectos() {
    this.verProyectosChange.emit(this.mostrarProyectos);
  }
}

