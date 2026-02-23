import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { TareasService } from '../../services/tareas.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { LabelsTasksService } from '../../services/labels-tasks.service';
import { TaskResponsibleService } from '../../services/task-responsible.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { EtiquetaTarea } from '../../interfaces/etiqueta-tarea.interface';
import { Tarea } from '../../interfaces/tarea.interface';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.interface';
import { DetalleTareaDialogComponent } from '../../dialogs/detalle-tarea-dialog/detalle-tarea-dialog.component';
import { ContenedorTareasComponent } from '../../components/contenedor-tareas/contenedor-tareas.component';
import { CabeceraTareasComponent } from '../../components/cabecera-tareas/cabecera-tareas.component';
import { DiagramaGantComponent } from "../../components/diagrama-gant/diagrama-gant.component";

@Component({
  selector: 'app-dashboard-tasks-page',
  standalone: true,
  imports: [
    DragDropModule,
    CommonModule,
    ToastModule,
    DetalleTareaDialogComponent,
    DropdownModule,
    FormsModule,
    ButtonModule,
    CabeceraTareasComponent,
    ContenedorTareasComponent,
    DiagramaGantComponent
],
  providers: [MessageService],
  templateUrl: './dashboard-tasks-page.html',
  styleUrl: './dashboard-tasks-page.scss'
})
export class DashboardTasksPageComponent implements OnInit {
  mostrarModalDetalleTarea: boolean = false;
  mostrarProyectos: boolean = false;
  mostrarGant: boolean = false;

  sucursales: Sucursal[] = [];
  sucursalesMap = new Map<string, string>();
  idSucursalSeleccionada: string = '';
  usuario: Usuario;
  etiquetasTodas: EtiquetaTarea[] = [];
  etiquetasFiltradas: EtiquetaTarea[] = [];
  idEtiquetaSeleccionada: string = '';
  tareas: Tarea[] = [];
  allTask: Tarea[] = [];
  // allProjects: Tarea[] = [];
  esGlobal: boolean = false;
  responsablesTodos: ResponsableTarea[] = [];
  idResponsableSeleccionado: string = '';
  idsResponsablesGlobales: string[] = [];
  sucursalSeleccionadaNombre?: string;
  textoBusqueda!: string;

  dropListIds = ['todoList', 'workingList', 'checkList', 'doneList'];
  tareaSeleccionada!: Tarea;
  responsableTarea!: ResponsableTarea;

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
    this.responsableTarea = JSON.parse(localStorage.getItem('responsable-tareas')!);

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
    this.tareas = [];

    this.tareasService.getAll().subscribe(tareas => this.allTask = tareas);

    // GLOBAL
    if (this.esGlobal) {
      this.tareasService.getAll().subscribe(tareas => {
        this.tareas = tareas;

        let tareasFiltradas = [...this.tareas];
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
        if (this.idEtiquetaSeleccionada && this.idEtiquetaSeleccionada != '') {
          this.onEtiquetaChange();
        }

        if (this.idResponsableSeleccionado) {
          this.onResponsableChange();
        }

      });

      return;
    }

    // LOCAL
    this.tareasService
      .getBySucursal(this.idSucursalSeleccionada)
      .subscribe(tareas => {
        // this.tareas = tareas;
        this.tareas = this.filtrarTareasVisibles(tareas, this.responsableTarea.id!);

        // this.tareas = this.filtrarTareasVisibles(tareas, this.responsableTarea.id!).filter(x => (x.esProyecto == false || x.esProyecto == undefined));
        // this.allProjects = this.filtrarTareasVisibles(tareas, this.responsableTarea.id!).filter(x => x.esProyecto == true);
        this.distribuirTareas(this.tareas);

        if (this.idEtiquetaSeleccionada && this.idEtiquetaSeleccionada != '') {
          this.onEtiquetaChange();
        }

        if (this.idResponsableSeleccionado) {
          this.onResponsableChange();
        }

      });

  }

  filtrarTareasVisibles(tareas: Tarea[], miIdResponsable: string): Tarea[] {
    return tareas.filter(tarea => {

      if (tarea.visibleGlobal === undefined) {
        return true;
      }

      if (tarea.visibleGlobal === true) {
        return true;
      }

      return tarea.idsResponsables?.includes(miIdResponsable) ?? false;
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

    const filtradas = this.tareas.filter(t =>
      t.idEtiqueta && t.idEtiqueta === this.idEtiquetaSeleccionada
    );

    this.toDo = filtradas.filter(x => x.idEstatus == '1');
    this.working = filtradas.filter(x => x.idEstatus == '2');
    this.check = filtradas.filter(x => x.idEstatus == '3');
    this.done = filtradas.filter(x => x.idEstatus == '4');

    let tareasfiltradas: Tarea[] = [...this.toDo, ...this.working, ...this.check];
    this.tareasService.updateTasks(tareasfiltradas);

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

    const filtradas = this.tareas.filter(t =>
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

    let tareasfiltradas: Tarea[] = [...this.toDo, ...this.working, ...this.check];
    this.tareasService.updateTasks(tareasfiltradas);
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

  get obtenerProyectos() {
    return this.allTask.filter(x => x.esProyecto);
  }
}
