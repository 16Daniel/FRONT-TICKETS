import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from "primeng/toast";

import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { TareasService } from '../../services/tareas.service';
import { StatusTaskService } from '../../services/status-task.service';
import { LabelsTasksService } from '../../services/labels-tasks.service';
import { TaskResponsibleService } from '../../services/task-responsible.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { TaskDetailComponent } from '../../dialogs/modal-task-detail/task-detail.component';
import { Tarea } from '../../interfaces/tarea.model';
import { EstatusTarea } from '../../interfaces/estatus-tarea.model';
import { EtiquetaTarea } from '../../interfaces/etiqueta-tarea.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.model';
import { TaskEisenhowerCard } from '../../components/task-eisenhower-card/task-eisenhower-card';

@Component({
  selector: 'app-eisenhower-matrix-page',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskEisenhowerCard, DropdownModule, FormsModule, TaskDetailComponent, ToastModule],
  providers: [MessageService],
  templateUrl: './eisenhower-matrix-page.html',
  styleUrl: './eisenhower-matrix-page.scss',
})
export class EisenhowerMatrixPageComponent implements OnInit {
  tc1: Tarea[] = [];
  tc2: Tarea[] = [];
  tc3: Tarea[] = [];
  tc4: Tarea[] = [];
  loading: boolean = true;
  dropListIds = ['c1', 'c2', 'c3', 'c4'];
  catEstatusTareas: EstatusTarea[] = [];
  usuario: Usuario;
  sucursales: Sucursal[] = [];
  idSucursalSeleccionada: string = '';

  etiquetasTodas: EtiquetaTarea[] = [];
  etiquetasFiltradas: EtiquetaTarea[] = [];
  etiquetaSeleccionada: string = '';
  allTasks: Tarea[] = [];

  responsablesTodos: ResponsableTarea[] = [];
  responsablesFiltrados: ResponsableTarea[] = [];
  responsableSeleccionado: string = '';

  mostrarModalDetalleTarea: boolean = false;
  tareaSeleccionada!: Tarea;

  constructor(
    private tareasService: TareasService,
    private messageService: MessageService,
    private statustaskService: StatusTaskService,
    private labelsTasksService: LabelsTasksService,
    private raskResponsibleService: TaskResponsibleService,
    private branchesService: BranchesService,
    private cdr: ChangeDetectorRef,
  ) {
    this.statustaskService.estatus$.subscribe(catEstatus => this.catEstatusTareas = catEstatus)
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.idSucursalSeleccionada = this.usuario.sucursales[0].id;
  }

  ngOnInit(): void {
    this.initData()
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

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => { },
    });
  }


  initData() {
    this.tareasService.getBySucursal(this.idSucursalSeleccionada).subscribe((tareas: Tarea[]) => {

      this.allTasks = tareas.filter(x => x.idEstatus != '4');

      this.tc1 = tareas.filter(x => x.idEstatus != '4' && x.idEisenhower == '1');
      this.tc2 = tareas.filter(x => x.idEstatus != '4' && x.idEisenhower == '2');
      this.tc3 = tareas.filter(x => x.idEstatus != '4' && x.idEisenhower == '3');
      this.tc4 = tareas.filter(x => x.idEstatus != '4' && x.idEisenhower == '4');
      this.loading = false;
      this.cdr.detectChanges();

      this.filtrarEtiquetas();
      this.filtrarResponsables();
    })
  }

  async drop(event: CdkDragDrop<Tarea[]>) {

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
      case 'c1':
        tareaMovida.idEisenhower = '1';
        tareaMovida.urgente = 'URGENTE';
        tareaMovida.importante = 'IMPORTANTE';
        break;
      case 'c2':
        tareaMovida.idEisenhower = '2';
        tareaMovida.urgente = 'NO URGENTE';
        tareaMovida.importante = 'IMPORTANTE';
        break;
      case 'c3':
        tareaMovida.idEisenhower = '3';
        tareaMovida.urgente = 'URGENTE';
        tareaMovida.importante = 'NO IMPORTANTE';
        break;
      case 'c4':
        tareaMovida.idEisenhower = '4';
        tareaMovida.urgente = 'NO URGENTE';
        tareaMovida.importante = 'NO IMPORTANTE';
        break;

    }

    await this.tareasService.update(tareaMovida, tareaMovida.id!);
    this.showMessage('success', 'Success', 'Enviado correctamente');
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  onSucursalChange() {
    this.initData();
    this.filtrarEtiquetas();
    this.filtrarResponsables();

  }

  onEtiquetaChange() {
    debugger
    if (!this.etiquetaSeleccionada || this.etiquetaSeleccionada === '') {
      this.initData();
      return;
    }

    const filtradas = this.allTasks.filter(t =>
      t.idEtiqueta && t.idEtiqueta === this.etiquetaSeleccionada
    );

    this.tc1 = filtradas.filter(x => x.idEstatus != '4' && x.idEisenhower == '1');
    this.tc2 = filtradas.filter(x => x.idEstatus != '4' && x.idEisenhower == '2');
    this.tc3 = filtradas.filter(x => x.idEstatus != '4' && x.idEisenhower == '3');
    this.tc4 = filtradas.filter(x => x.idEstatus != '4' && x.idEisenhower == '4');
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

  onResponsableChange() {

    if (!this.responsableSeleccionado || this.responsableSeleccionado === '') {
      this.initData();
      return;
    }

    const filtradas = this.allTasks.filter(t =>
      Array.isArray(t.idsResponsables) &&
      t.idsResponsables.includes(this.responsableSeleccionado)
    );

    this.tc1 = filtradas.filter(x => x.idEstatus != '4' && x.idEisenhower == '1');
    this.tc2 = filtradas.filter(x => x.idEstatus != '4' && x.idEisenhower == '2');
    this.tc3 = filtradas.filter(x => x.idEstatus != '4' && x.idEisenhower == '3');
    this.tc4 = filtradas.filter(x => x.idEstatus != '4' && x.idEisenhower == '4');

    this.cdr.detectChanges();
  }

  abrirDetalle(tarea: Tarea) {
    this.tareaSeleccionada = { ...tarea };
    this.mostrarModalDetalleTarea = true;
  }

}
