import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';

import { TaskCardComponent } from '../task-card/task-card.component';
import { Tarea } from '../../../models/tarea.model';
import { TareasService } from '../../../services/tareas.service';
import { Sucursal } from '../../../models/sucursal.model';
import { ModalLabelsTaskComponent } from '../../../modals/tasks/modal-labels-task/modal-labels-task.component';
import { BranchesService } from '../../../services/branches.service';
import { Usuario } from '../../../models/usuario.model';
import { LabelsTasksService } from '../../../services/labels-tasks.service';
import { EtiquetaTarea } from '../../../models/etiqueta-tarea.model';
import { ButtonModule } from 'primeng/button';
import { ModalTaskResponsibleComponent } from '../../../modals/tasks/modal-task-responsible/modal-task-responsible.component';
import { TaskResponsibleService } from '../../../services/task-responsible.service';
import { ResponsableTarea } from '../../../models/responsable-tarea.model';
import { NewTaskComponent } from '../../../modals/tasks/modal-new-task/new-task.component';
import { TaskDetailComponent } from '../../../modals/tasks/modal-task-detail/task-detail.component';
import { ModalArchivedTasksComponent } from '../../../modals/tasks/modal-archived-tasks/modal-archived-tasks.component';

@Component({
  selector: 'app-dashboard-tasks',
  standalone: true,
  imports: [
    DragDropModule,
    CommonModule,
    NewTaskComponent,
    TaskCardComponent,
    ToastModule,
    TaskDetailComponent,
    DropdownModule,
    FormsModule,
    ModalLabelsTaskComponent,
    ButtonModule,
    ModalTaskResponsibleComponent,
    ModalArchivedTasksComponent
  ],
  providers: [MessageService],
  templateUrl: './dashboard-tasks.component.html',
  styleUrl: './dashboard-tasks.component.scss'
})
export class DashboardTasksComponent implements OnInit {
  mostrarModalDetalleTarea: boolean = false;
  mostrarModalEtiquetas: boolean = false;
  mostrarModalResponsables: boolean = false;
  mostrarModalArchivados: boolean = false;

  sucursales: Sucursal[] = [];
  sucursalesMap = new Map<string, string>();
  idSucursalSeleccionada: string = '';
  usuario: Usuario;
  // etiquetas: EtiquetaTarea[] = [];
  etiquetasTodas: EtiquetaTarea[] = [];
  etiquetasFiltradas: EtiquetaTarea[] = [];
  etiquetaSeleccionada: string = '';
  allTasks: Tarea[] = [];

  responsablesTodos: ResponsableTarea[] = [];
  responsablesFiltrados: ResponsableTarea[] = [];
  responsableSeleccionado: string = '';

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

    this.initData();
    this.obtenerSucursales();

    this.labelsTasksService.etiquetas$.subscribe(et => {
      this.etiquetasTodas = et;
      this.filtrarEtiquetas();
    });

    this.raskResponsibleService.responsables$.subscribe(responsable => {
      this.responsablesTodos = responsable;
      this.filtrarResponsables();
    });
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

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;

        this.sucursalesMap.clear();
        data.forEach(s =>
          this.sucursalesMap.set(s.id!, s.nombre)
        );

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

  initData() {
    this.tareasService.getBySucursal(this.idSucursalSeleccionada).subscribe((tareas: Tarea[]) => {

      this.allTasks = tareas.filter(x =>
        x.idEstatus == '1'
        || x.idEstatus == '2'
        || x.idEstatus == '3'
        || x.idEstatus == '4'
      );

      this.toDo = tareas.filter(x => x.idEstatus == '1');
      this.working = tareas.filter(x => x.idEstatus == '2');
      this.check = tareas.filter(x => x.idEstatus == '3');
      this.done = tareas.filter(x => x.idEstatus == '4');

      this.cdr.detectChanges();
    });
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  abrirDetalle(tarea: Tarea) {
    this.tareaSeleccionada = { ...tarea };
    this.mostrarModalDetalleTarea = true;
  }

  onSucursalChange() {
    this.etiquetaSeleccionada = '';
    this.responsableSeleccionado = '';

    this.initData();
    this.filtrarEtiquetas();
    this.filtrarResponsables();

  }

  onEtiquetaChange() {

    if (!this.etiquetaSeleccionada || this.etiquetaSeleccionada === '') {
      this.initData();
      return;
    }

    const filtradas = this.allTasks.filter(t =>
      t.idEtiqueta && t.idEtiqueta === this.etiquetaSeleccionada
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

  filtrarResponsables(): void {
    if (!this.idSucursalSeleccionada) {
      this.responsablesFiltrados = this.responsablesTodos;
      return;
    }

    this.responsablesFiltrados =
      this.raskResponsibleService.filtrarPorSucursal(this.idSucursalSeleccionada);
  }

  async onResponsableChange() {
    // 1. Si se limpia el filtro (clear), volvemos al estado inicial de la sucursal
    if (!this.responsableSeleccionado) {
      this.initData();
      return;
    }

    // 2. Buscamos el objeto completo para verificar si es global
    const resp = this.responsablesTodos.find(r => r.id === this.responsableSeleccionado);

    if (resp?.esGlobal) {
      // ESCENARIO GLOBAL: Consultamos a Firestore todas las tareas que tengan este responsable
      // sin importar la sucursal.
      this.tareasService.getTareasPorResponsableGlobal(resp.id!).subscribe((tareas: Tarea[]) => {
        this.distribuirTareas(tareas);
      });
    } else {
      // ESCENARIO LOCAL: initData ya trajo las tareas de la sucursal seleccionada
      const filtradas = this.allTasks.filter(t =>
        Array.isArray(t.idsResponsables) &&
        t.idsResponsables.includes(this.responsableSeleccionado)
      );
      this.distribuirTareas(filtradas);
    }
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

}
