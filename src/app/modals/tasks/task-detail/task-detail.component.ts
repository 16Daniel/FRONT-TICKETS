import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';

import { Tarea } from '../../../models/tarea.model';
import { CategoriaTarea } from '../../../models/categoria-tarea.model';
import { CategoriasTareasService } from '../../../services/categorias-tareas.service';
import { Sucursal } from '../../../models/sucursal.model';
import { BranchesService } from '../../../services/branches.service';
import { TareasService } from '../../../services/tareas.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ModalVisorVariasImagenesComponent } from '../../modal-visor-varias-imagenes/modal-visor-varias-imagenes.component';
import { TaskImguploaderComponent } from '../task-imguploader/task-imguploader.component';
import { TaskCommentBoxComponent } from '../../../components/tasks/task-comment-box/task-comment-box.component';
import { EstatusEisenhower } from '../../../models/estatus-eisenhower.model';
import { StatusTaskService } from '../../../services/status-task.service';
import { EstatusTarea } from '../../../models/estatus-tarea.model';
import { StatusEisenhowerService } from '../../../services/status-eisenhower.service';
import { EisenhowerPriorityChecksComponent } from '../../../components/tasks/eisenhower-priority-checks/eisenhower-priority-checks.component';

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
    EisenhowerPriorityChecksComponent
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent implements OnInit {
  @Input() mostrarModal: boolean = false;
  @Input() tarea!: Tarea | any;
  @Output() closeEvent = new EventEmitter<boolean>();

  categorias: CategoriaTarea[] = [];
  sucursales: Sucursal[] = [];
  mostrarModalVisorImagen: boolean = false;
  mostrarModalSubirImagen: boolean = false;
  imagenes: string[] = [];
  estatusTeras: EstatusTarea[] = [];
  catalogoEstatus: EstatusEisenhower[] = []

  constructor(
    private categoriasService: CategoriasTareasService,
    private cdr: ChangeDetectorRef,
    private branchesService: BranchesService,
    private tareasService: TareasService,
    private messageService: MessageService,
    private statusTaskService: StatusTaskService,
    private statusEisenhowerService: StatusEisenhowerService
  ) { }

  ngOnInit(): void {
    this.obtenerSucursales();
    this.categoriasService.categorias$.subscribe(categorias => this.categorias = categorias);
    this.statusTaskService.estatus$.subscribe(estatus => this.estatusTeras = estatus);
    this.statusEisenhowerService.estatus$.subscribe(estatus => console.log(estatus));
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

}
