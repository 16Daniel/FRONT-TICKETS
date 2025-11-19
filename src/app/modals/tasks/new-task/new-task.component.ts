import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';

import { Sucursal } from '../../../models/sucursal.model';
import { Tarea } from '../../../models/tarea.model';
import { CategoriaTarea } from '../../../models/categoria-tarea.model';
import { BranchesService } from '../../../services/branches.service';
import { CategoriasTareasService } from '../../../services/categorias-tareas.service';
import { TareasService } from '../../../services/tareas.service';

@Component({
  selector: 'app-new-task',
  standalone: true,
  imports: [
    DialogModule,
    FormsModule,
    CommonModule,
    DropdownModule
  ],
  templateUrl: './new-task.component.html',
  styleUrl: './new-task.component.scss'
})
export class NewTaskComponent implements OnInit {
  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  imagenesEvidencia: string[] = [];
  imagenesBase64: string[] = [];
  archivos: File[] = [];

  tarea: Tarea = new Tarea();
  sucursales: Sucursal[] = [];
  categorias: CategoriaTarea[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private branchesService: BranchesService,
    private categoriasService: CategoriasTareasService,
    private tareasService: TareasService
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

      Swal.fire({
        title: "ATENCIÓN!",
        text: "COMPLETA TODOS LOS CAMPOS DEL FORMULARIO",
        icon: "warning",
        customClass: {
          container: 'swal-topmost'
        }
      });

      return;
    }

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
}
