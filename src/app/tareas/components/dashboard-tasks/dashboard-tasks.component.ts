import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

import { Tarea } from '../../../models/tarea.model';
import { TareasService } from '../../../services/tareas.service';
import { Sucursal } from '../../../models/sucursal.model';
import { BranchesService } from '../../../services/branches.service';
import { Usuario } from '../../../models/usuario.model';
import { LabelsTasksService } from '../../../services/labels-tasks.service';
import { EtiquetaTarea } from '../../../models/etiqueta-tarea.model';
import { TaskResponsibleService } from '../../../services/task-responsible.service';
import { ResponsableTarea } from '../../../models/responsable-tarea.model';
import { TaskDetailComponent } from '../../../modals/tasks/modal-task-detail/task-detail.component';
import { TasksFilterComponentComponent } from '../tasks-filter-component/tasks-filter-component.component';
import { TasksBoardComponent } from '../tasks-board/tasks-board.component';

@Component({
  selector: 'app-dashboard-tasks',
  standalone: true,
  imports: [
    DragDropModule,
    CommonModule,
    ToastModule,
    TaskDetailComponent,
    DropdownModule,
    FormsModule,
    ButtonModule,
    TasksFilterComponentComponent,
    TasksBoardComponent
  ],
  providers: [MessageService],
  templateUrl: './dashboard-tasks.component.html',
  styleUrl: './dashboard-tasks.component.scss'
})
export class DashboardTasksComponent implements OnInit {
  mostrarModalDetalleTarea: boolean = false;

  sucursales: Sucursal[] = [];
  sucursalesMap = new Map<string, string>();
  idSucursalSeleccionada: string = '';
  usuario: Usuario;
  etiquetasTodas: EtiquetaTarea[] = [];
  etiquetasFiltradas: EtiquetaTarea[] = [];
  idEtiquetaSeleccionada: string = '';
  allTasks: Tarea[] = [];
  esGlobal: boolean = false;
  responsablesTodos: ResponsableTarea[] = [];
  idResponsableSeleccionado: string = '';
  idsResponsablesGlobales: string[] = [];
  sucursalSeleccionadaNombre?: string;
  textoBusqueda!: string;

  dropListIds = ['todoList', 'workingList', 'checkList', 'doneList'];
  tareaSeleccionada!: Tarea;

  toDo: Tarea[] = [];
  working: Tarea[] = [];
  check: Tarea[] = [];
  done: Tarea[] = [];

  constructor(
    private tareasService: TareasService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private branchesService: BranchesService,
    private labelsTasksService: LabelsTasksService,
    private raskResponsibleService: TaskResponsibleService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.idSucursalSeleccionada = this.usuario.sucursales[0].id;
  }

  ngOnInit(): void {
    // this.tareasService.normalizarOrden();

    this.obtenerTareas();
    this.obtenerSucursales();

    this.labelsTasksService.etiquetas$.subscribe(et => {
      this.etiquetasTodas = et;
      this.filtrarEtiquetas();
    });

    this.raskResponsibleService.responsables$.subscribe(responsables => {
      this.responsablesTodos = responsables;
      // this.filtrarResponsables();
    });
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;

        this.sucursalesMap.clear();
        data.forEach(s =>
          this.sucursalesMap.set(s.id!, s.nombre)
        );

        // Nombre inicial (modo local)
        if (this.idSucursalSeleccionada) {
          this.sucursalSeleccionadaNombre =
            this.sucursalesMap.get(this.idSucursalSeleccionada);
        }

        this.cdr.detectChanges();
      }
    });
  }

  async drop(event: CdkDragDrop<Tarea[]>) {
    // console.log("ORIGEN:", event.previousContainer.id, event.previousContainer.data);
    // console.log("DESTINO:", event.container.id, event.container.data);

    const tareaMovida = event.item.data as Tarea;
    // console.log("TAREA MOVIDA:", tareaMovida);

    if (!tareaMovida) {
      // console.warn("No se pudo obtener la tarea movida");
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

    // await this.tareasService.update(tareaMovida, tareaMovida.id!);

    // debugger
    this.actualizarOrdenColumna(event.container.data);

    if (event.previousContainer !== event.container) {
      this.actualizarOrdenColumna(event.previousContainer.data);
    }

    await this.tareasService.update({ idEstatus: tareaMovida.idEstatus }, tareaMovida.id!);

    this.showMessage('success', 'Success', 'Enviado correctamente');
  }

  obtenerTareas() {
    this.allTasks = [];

    // GLOBAL
    if (this.esGlobal) {
      this.tareasService.getAll().subscribe(tareas => {
        this.allTasks = tareas;

        let tareasFiltradas = [...this.allTasks];
        const texto = this.textoBusqueda?.trim().toLowerCase();

        // FILTRO POR TEXTO (titulo + descripcion)
        if (texto) {
          tareasFiltradas = tareasFiltradas.filter(t =>
            t.titulo?.toLowerCase().includes(texto) ||
            t.descripcion?.toLowerCase().includes(texto)
          );
        }
        // 👥 FILTRO POR RESPONSABLES
        else if (this.idsResponsablesGlobales.length > 0) {
          tareasFiltradas = tareasFiltradas.filter(t =>
            t.idsResponsables?.some(id =>
              this.idsResponsablesGlobales.includes(id)
            )
          );
        }

        this.distribuirTareas(tareasFiltradas);
      });

      return;
    }

    // LOCAL
    this.tareasService
      .getBySucursal(this.idSucursalSeleccionada)
      .subscribe(tareas => {
        this.allTasks = tareas;
        this.distribuirTareas(this.allTasks);
      });

  }

  showMessage = (sev: string, summ: string, det: string) =>
    this.messageService.add({ severity: sev, summary: summ, detail: det });

  abrirDetalle(tarea: Tarea) {
    this.tareaSeleccionada = { ...tarea };
    this.mostrarModalDetalleTarea = true;
  }

  onSucursalChange() {
    this.sucursalSeleccionadaNombre =
      this.sucursalesMap.get(this.idSucursalSeleccionada);

    this.idEtiquetaSeleccionada = '';
    this.idResponsableSeleccionado = '';

    this.obtenerTareas();
    this.filtrarEtiquetas();
    // this.filtrarResponsables();
  }

  onEtiquetaChange() {

    if (!this.idEtiquetaSeleccionada || this.idEtiquetaSeleccionada === '') {
      this.obtenerTareas();
      return;
    }

    const filtradas = this.allTasks.filter(t =>
      t.idEtiqueta && t.idEtiqueta === this.idEtiquetaSeleccionada
    );

    this.toDo = filtradas.filter(x => x.idEstatus == '1');
    this.working = filtradas.filter(x => x.idEstatus == '2');
    this.check = filtradas.filter(x => x.idEstatus == '3');
    this.done = filtradas.filter(x => x.idEstatus == '4');

    this.cdr.detectChanges();
  }

  filtrarEtiquetas(): void {
    if (!this.idSucursalSeleccionada) {
      this.etiquetasFiltradas = this.etiquetasTodas;
      return;
    }

    this.etiquetasFiltradas =
      this.labelsTasksService.filtrarPorSucursal(this.idSucursalSeleccionada);
  }

  async onResponsableChange() {
    if (!this.idResponsableSeleccionado) {
      this.obtenerTareas();
      return;
    }

    const filtradas = this.allTasks.filter(t =>
      Array.isArray(t.idsResponsables) &&
      t.idsResponsables.includes(this.idResponsableSeleccionado)
    );
    this.distribuirTareas(filtradas);
  }

  private distribuirTareas(tareas: Tarea[]) {

    this.toDo = tareas.filter(x => x.idEstatus === '1');
    this.working = tareas.filter(x => x.idEstatus === '2');
    this.check = tareas.filter(x => x.idEstatus === '3');
    this.done = tareas.filter(x => x.idEstatus === '4');

    this.cdr.detectChanges();
  }

  private actualizarOrdenColumna(tareas: Tarea[]) {
    tareas.forEach((tarea, index) => {
      if (tarea.orden !== index) {
        tarea.orden = index;
        this.tareasService.update({ orden: index }, tarea.id!);
      }
    });
  }

  onResponsablesGlobalesChange(): void {
    this.obtenerTareas();
  }

  onBuscarText(texto: string) {
    this.textoBusqueda = texto;
    this.obtenerTareas();
  }
}
