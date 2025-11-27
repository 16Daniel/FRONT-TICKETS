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
    TaskCommentBoxComponent
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

  // imagenesEvidencia: string[] = [];
  // imagenesBase64: string[] = [];
  // archivos: File[] = [];

  constructor(
    private categoriasService: CategoriasTareasService,
    private cdr: ChangeDetectorRef,
    private branchesService: BranchesService,
    private tareasService: TareasService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.obtenerSucursales();
    this.categoriasService.categorias$.subscribe(categorias => this.categorias = categorias);
  }

  onHide = () => this.closeEvent.emit(false);

  async enviar(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      return;
    }

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

  // onFileChange(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (!input.files?.length) return;

  //   this.archivos = Array.from(input.files);

  //   this.imagenesBase64 = [];

  //   this.archivos.forEach(file => {
  //     const reader = new FileReader();

  //     reader.onload = () => {
  //       if (typeof reader.result === 'string') {
  //         this.imagenesBase64.push(reader.result);
  //         this.cdr.detectChanges();
  //       }
  //     };

  //     reader.readAsDataURL(file);
  //   });
  // }

  // onSeleccionarImagenes() {
  //   const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  //   if (fileInput) {
  //     fileInput.click();
  //   }
  // }
}
