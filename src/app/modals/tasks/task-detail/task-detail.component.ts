import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import Swal from 'sweetalert2';

import { Tarea } from '../../../models/tarea.model';
import { Sucursal } from '../../../models/sucursal.model';
import { BranchesService } from '../../../services/branches.service';
import { TareasService } from '../../../services/tareas.service';
import { ModalVisorVariasImagenesComponent } from '../../modal-visor-varias-imagenes/modal-visor-varias-imagenes.component';
import { TaskImguploaderComponent } from '../task-imguploader/task-imguploader.component';
import { TaskCommentBoxComponent } from '../../../components/tasks/task-comment-box/task-comment-box.component';
import { EstatusEisenhower } from '../../../models/estatus-eisenhower.model';
import { StatusTaskService } from '../../../services/status-task.service';
import { EstatusTarea } from '../../../models/estatus-tarea.model';
import { StatusEisenhowerService } from '../../../services/status-eisenhower.service';
import { EisenhowerPriorityChecksComponent } from '../../../components/tasks/eisenhower-priority-checks/eisenhower-priority-checks.component';
import { SubtasksBoxComponent } from '../../../components/tasks/subtasks-box/subtasks-box.component';
import { EtiquetaTarea } from '../../../models/etiqueta-tarea.model';
import { LabelsTasksService } from '../../../services/labels-tasks.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    DialogModule,
    FormsModule,
    DropdownModule,
    CommonModule,
    TooltipModule,
    ToastModule,
    ModalVisorVariasImagenesComponent,
    TaskImguploaderComponent,
    TaskCommentBoxComponent,
    EisenhowerPriorityChecksComponent,
    SubtasksBoxComponent
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent implements OnInit {
  @Input() mostrarModal: boolean = false;
  @Input() tarea!: Tarea | any;
  @Output() closeEvent = new EventEmitter<boolean>();

  sucursales: Sucursal[] = [];
  mostrarModalVisorImagen: boolean = false;
  mostrarModalSubirImagen: boolean = false;
  imagenes: string[] = [];
  estatusTeras: EstatusTarea[] = [];
  catalogoEstatus: EstatusEisenhower[] = []
  mostrarSubtareas: boolean = false;
  nuevaSubtarea: string = '';
  etiquetas: EtiquetaTarea[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private branchesService: BranchesService,
    private tareasService: TareasService,
    private messageService: MessageService,
    private statusTaskService: StatusTaskService,
    private statusEisenhowerService: StatusEisenhowerService,
    private labelsTasksService: LabelsTasksService
  ) { }

  ngOnInit(): void {
    this.obtenerSucursales();
    this.statusTaskService.estatus$.subscribe(estatus => this.estatusTeras = estatus);
    this.statusEisenhowerService.estatus$.subscribe(estatus => console.log(estatus));

    this.mostrarSubtareas = this.tarea?.subtareas?.length > 0;

    this.labelsTasksService.etiquetas$.subscribe(et => {
      debugger
      this.etiquetas = et;
    });
  }

  onHide = () => this.closeEvent.emit(false);

  async enviar(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      return;
    }

    console.log(this.tarea);
    await this.tareasService.update(this.tarea, this.tarea.id);
    this.showMessage('success', 'Success', 'Enviado correctamente');
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

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  onEliminarImagen(event: any) {
    // this.actualizarImagenesPorTitulo(event.titulo, event.url)
  }

  abrirModalImagenes() {
    this.imagenes = this.tarea.evidenciaUrls;
    this.mostrarModalVisorImagen = true;
  }

  recibirPrioridad(event: any) {
    this.tarea.urgente = event.urgente;
    this.tarea.importante = event.importante;
    this.tarea.idEisenhower = event.idEisenhower;
  }

  agregarSubtarea(texto: string) {
    this.tarea.subtareas = this.tarea.subtareas || [];
    this.tarea.subtareas.push({
      titulo: texto,
      terminado: false
    });
  }

  getProgressColor(porcentaje: number) {
    if (porcentaje < 40) return 'bg-danger';
    if (porcentaje < 70) return 'bg-warning';
    return 'bg-success';
  }

  abrirVisor(index: number) {
    this.imagenes = this.tarea.evidenciaUrls;
    this.mostrarModalVisorImagen = true;
  }

  async eliminarTarea(tarea: Tarea) {
    const result = await Swal.fire({
      title: '¿Eliminar tarea?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      customClass: {
        container: 'swal-topmost'
      }
    });

    if (!result.isConfirmed) return;

    tarea.eliminado = true;
    this.onHide();
    try {
      await this.tareasService.update(tarea, tarea.id!);
      this.showMessage('success', 'Eliminada', 'La tarea fue eliminada correctamente');
    } catch (error) {
      this.showMessage('error', 'Error', 'No se pudo eliminar la tarea');
    }
  }

  async toggleSubtareas() {

    // Si están visibles y existen subtareas → preguntar
    if (
      this.mostrarSubtareas &&
      this.tarea.subtareas &&
      this.tarea.subtareas.length > 0
    ) {

      const result = await Swal.fire({
        title: '¿Eliminar subtareas?',
        text: 'Esta tarea tiene subtareas. ¿Deseas eliminarlas?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'No, conservar',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        customClass: {
        container: 'swal-topmost'
      }
      });

      // Si cancela → solo ocultar
      if (!result.isConfirmed) {
        this.mostrarSubtareas = false;
        return;
      }

      // Si confirma → eliminar subtareas
      this.tarea.subtareas = [];
      this.mostrarSubtareas = false;
      return;
    }

    // Mostrar subtareas normalmente
    this.mostrarSubtareas = !this.mostrarSubtareas;

    // Inicializar arreglo si no existe
    if (!this.tarea.subtareas) {
      this.tarea.subtareas = [];
    }
  }

}
