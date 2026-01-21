import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import Swal from 'sweetalert2';

import { TaskImguploaderComponent } from '../task-imguploader/task-imguploader.component';
import { ModalVisorVariasImagenesComponent } from '../../../shared/dialogs/modal-visor-varias-imagenes/modal-visor-varias-imagenes.component';
import { TaskCommentBoxComponent } from '../../components/task-comment-box/task-comment-box.component';
import { EisenhowerPriorityChecksComponent } from '../../components/eisenhower-priority-checks/eisenhower-priority-checks.component';
import { SubtasksBoxComponent } from '../../components/subtasks-box/subtasks-box.component';
import { LinkifyPipe } from '../../../shared/pipes/linkify.pipe';
import { Area } from '../../../areas/models/area.model';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { TareasService } from '../../services/tareas.service';
import { StatusTaskService } from '../../services/status-task.service';
import { LabelsTasksService } from '../../services/labels-tasks.service';
import { AreasService } from '../../../areas/services/areas.service';
import { TaskResponsibleService } from '../../services/task-responsible.service';
import { EnviarCorreoRequest, MailService } from '../../../shared/services/mail.service';
import { Tarea } from '../../interfaces/tarea.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { EstatusTarea } from '../../interfaces/estatus-tarea.model';
import { EstatusEisenhower } from '../../interfaces/estatus-eisenhower.model';
import { EtiquetaTarea } from '../../interfaces/etiqueta-tarea.model';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.model';
import { AvatarModule } from 'ngx-avatars';

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
    SubtasksBoxComponent,
    LinkifyPipe,
    MultiSelectModule,
    AvatarModule
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent implements OnInit {
  @Input() mostrarModal: boolean = false;
  @Input() tarea!: Tarea;
  @Output() closeEvent = new EventEmitter<boolean>();

  sucursales: Sucursal[] = [];
  sucursalesMap = new Map<string, string>();
  mostrarModalVisorImagen: boolean = false;
  mostrarModalSubirImagen: boolean = false;
  imagenes: string[] = [];
  estatusTeras: EstatusTarea[] = [];
  catalogoEstatus: EstatusEisenhower[] = []
  mostrarSubtareas: boolean = false;
  nuevaSubtarea: string = '';
  etiquetas: EtiquetaTarea[] = [];
  areas: Area[] = [];
  editandoDescripcion = false;
  descripcionEditada = '';
  responsables: ResponsableTarea[] = [];
  areasMap: Record<string, string> = {};

  idsResponsablesAuxEmail: string[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private branchesService: BranchesService,
    private tareasService: TareasService,
    private messageService: MessageService,
    private statusTaskService: StatusTaskService,
    // private statusEisenhowerService: StatusEisenhowerService,
    private labelsTasksService: LabelsTasksService,
    private areasService: AreasService,
    private taskResponsibleService: TaskResponsibleService,
    private mailService: MailService
  ) { }

  ngOnInit(): void {
    this.obtenerSucursales();
    this.statusTaskService.estatus$.subscribe(estatus => this.estatusTeras = estatus);
    // this.statusEisenhowerService.estatus$.subscribe(estatus => console.log(estatus));

    this.mostrarSubtareas = this.tarea?.subtareas?.length! > 0;

    this.labelsTasksService.etiquetas$.subscribe(et => {
      this.etiquetas = et;
      this.etiquetas = this.labelsTasksService.filtrarPorSucursal(this.tarea.idSucursal);

    });

    this.taskResponsibleService.responsables$.subscribe(responsables => {
      this.responsables = responsables;
      this.responsables = this.taskResponsibleService.filtrarPorSucursal(this.tarea.idSucursal);
    });

    this.areasService.areas$.subscribe(areas => {
      this.areasMap = {};
      areas.forEach(a => {
        this.areasMap[a.id] = a.nombre;
      });
    });

    this.idsResponsablesAuxEmail = this.tarea.idsResponsables;
  }

  onHide = () => this.closeEvent.emit(false);

  async enviar(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      return;
    }

    await this.tareasService.update(this.tarea, this.tarea.id!);
    this.showMessage('success', 'Success', 'Enviado correctamente');

    this.tarea.idsResponsables.forEach((idResponsable: string) => {
      if (!this.idsResponsablesAuxEmail.find(x => x == idResponsable)) {
        const responasble = this.responsables.find(x => x.id == idResponsable);

        if (responasble?.correo) {
          this.enviarCorreo(responasble);
          this.idsResponsablesAuxEmail.push(idResponsable);
        }
      }
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

        this.cdr.detectChanges();
      }
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

  editarDescripcion() {
    this.editandoDescripcion = true;
    this.descripcionEditada = this.tarea.descripcion || '';
  }

  cancelarEdicionDescripcion() {
    this.editandoDescripcion = false;
    this.descripcionEditada = '';
  }

  guardarDescripcion() {
    this.tarea.descripcion = this.descripcionEditada;
    this.editandoDescripcion = false;
  }

  enviarCorreo(responsable: ResponsableTarea) {

    const request: EnviarCorreoRequest = {
      titulo: `Nueva tarea asignada: ${this.tarea.titulo}`,
      body: this.generarBodyCorreo(responsable),
      destinatario: responsable.correo
    };

    this.mailService.enviarCorreo(request).subscribe({
      next: res => {
        this.showMessage('success', 'Success', 'Email enviado');
        console.log('Correo enviado correctamente', res);
      },
      error: err => {
        console.error('Error al enviar correo', err);
      }
    });
  }

  private generarBodyCorreo(responsable: ResponsableTarea): string {
    return `
    <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333; line-height: 1.4;">

      <h3 style="color: #2c3e50; margin-bottom: 8px;">
        📌 Nueva tarea asignada
      </h3>

      <p style="margin: 0 0 8px 0;">
        Hola <strong>${responsable.nombre}</strong>,
      </p>

      <p style="margin: 0 0 12px 0;">
        Se te ha asignado una nueva tarea:
      </p>

      <div style="padding: 10px 12px; background-color: #f8f9fa; border-radius: 6px;">

        <p style="margin: 4px 0;">
          <strong>Título:</strong> ${this.tarea.titulo}
        </p>

        <p style="margin: 4px 0;">
          <strong>Descripción:</strong> ${this.tarea.descripcion || 'Sin descripción'}
        </p>

        <p style="margin: 4px 0;">
          <strong>Sucursal:</strong> ${this.sucursales.find(x => x.id == this.tarea.idSucursal)?.nombre || 'N/A'}
        </p>

        <p style="margin: 4px 0;">
          <strong>Fecha creación:</strong>
          ${this.tarea.fecha ? new Date(this.tarea.fecha).toLocaleDateString() : 'N/A'}
        </p>

        ${this.tarea.deathline
        ? `
              <p style="margin: 4px 0; color: #c0392b;">
                <strong>Fecha límite:</strong>
                ${new Date(this.tarea.deathline).toLocaleDateString()}
              </p>
            `
        : ''
      }

      </div>

      <p style="margin-top: 14px;">
        Por favor ingresa al sistema para revisar la tarea y darle seguimiento.
      </p>

      <hr style="margin: 16px 0;" />

      <p style="font-size: 12px; color: #777; margin: 0;">
        Este correo fue generado automáticamente por el sistema de tickets.
      </p>

    </div>
  `;
  }

  getResponsablesDeTarea(tarea: Tarea) {
    return this.responsables.filter(r =>
      tarea.idsResponsables?.includes(r.id!)
    );
  }
}
