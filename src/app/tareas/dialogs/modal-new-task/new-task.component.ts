import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import Swal from 'sweetalert2';

import { EisenhowerPriorityChecksComponent } from '../../components/eisenhower-priority-checks/eisenhower-priority-checks.component';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { TareasService } from '../../services/tareas.service';
import { FirebaseStorageService } from '../../../shared/services/firebase-storage.service';
import { TaskResponsibleService } from '../../services/task-responsible.service';
import { Tarea } from '../../interfaces/tarea.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.model';
import { AvatarModule } from 'ngx-avatars';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-new-task',
  standalone: true,
  imports: [
    DialogModule,
    FormsModule,
    CommonModule,
    DropdownModule,
    EisenhowerPriorityChecksComponent,
    MultiSelectModule,
    AvatarModule,
    TooltipModule
  ],
  templateUrl: './new-task.component.html',
  styleUrl: './new-task.component.scss'
})
export class NewTaskComponent implements OnInit {
  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  usuario: Usuario;

  imagenesEvidencia: string[] = [];
  imagenesBase64: string[] = [];
  archivos: File[] = [];

  tarea: Tarea = new Tarea();
  sucursales: Sucursal[] = [];
  sucursalesMap = new Map<string, string>();
  responsables: ResponsableTarea[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private branchesService: BranchesService,
    private tareasService: TareasService,
    private firebaseStorage: FirebaseStorageService,
    private taskResponsibleService: TaskResponsibleService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.tarea.idSucursal = this.usuario.sucursales[0].id;

  }

  ngOnInit(): void {
    this.obtenerSucursales();
  }

  onHide = () => this.closeEvent.emit(false);

  async enviar(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      return;
    }

    this.firebaseStorage.cargarImagenesEvidenciasTareas(this.archivos)
      .then(async urls => {
        this.tarea.evidenciaUrls = urls;

        const cantidad = await this.getCantidadPorEstatus(this.tarea.idEstatus);
        this.tarea.orden = cantidad;

        await this.tareasService.create({ ...this.tarea });
        Swal.fire({
          title: "OK",
          text: "TAREA CREADA!",
          icon: "success",
          customClass: {
            container: 'swal-topmost'
          }
        });
        this.closeEvent.emit();
      })
      .catch(async err => {
        console.error('Error al subir una o más imágenes:', err);
        Swal.fire({
          title: "ERROR",
          text: "ERROR AL SUBIR LAS IMÁGENES!",
          icon: "error",
          customClass: {
            container: 'swal-topmost'
          }
        });
        await this.tareasService.create({ ...this.tarea });
        Swal.fire("OK", "TAREA CREADA!", "success");
        // this.showMessage('success', 'Success', 'Enviado correctamente');
        this.closeEvent.emit();
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

        this.actualizarResponsables();
        this.cdr.detectChanges();
      }
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.archivos = Array.from(input.files);

    this.imagenesBase64 = [];

    this.archivos.forEach(file => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.imagenesBase64.push(reader.result);
          this.cdr.detectChanges();
        }
      };

      reader.readAsDataURL(file);
    });
  }

  onSeleccionarImagenes() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  calcularEisenhower() {
    const urgente = this.tarea.urgente;
    const importante = this.tarea.importante;

    if (!urgente || !importante) return;

    if (urgente === 'URGENTE' && importante === 'IMPORTANTE') {
      this.tarea.idEisenhower = '1';
    }
    else if (urgente === 'NO URGENTE' && importante === 'IMPORTANTE') {
      this.tarea.idEisenhower = '2';
    }
    else if (urgente === 'URGENTE' && importante === 'NO IMPORTANTE') {
      this.tarea.idEisenhower = '3';
    }
    else if (urgente === 'NO URGENTE' && importante === 'NO IMPORTANTE') {
      this.tarea.idEisenhower = '4';
    }
  }

  recibirPrioridad(event: any) {
    this.tarea.urgente = event.urgente;
    this.tarea.importante = event.importante;
    this.tarea.idEisenhower = event.idEisenhower;
  }

  getCantidadPorEstatus(idEstatus: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.tareasService.getByEstatus(idEstatus).subscribe({
        next: tareas => resolve(tareas.length),
        error: err => reject(err)
      });
    });
  }

  private actualizarResponsables(): void {
    this.responsables = this.taskResponsibleService.filtrarPorSucursal(this.tarea.idSucursal);
  }

  onSucursalesChange() {
    this.actualizarResponsables();
  }

  getResponsablesDeTarea(tarea: Tarea) {
    return this.responsables.filter(r =>
      tarea.idsResponsables?.includes(r.id!)
    );
  }
}
