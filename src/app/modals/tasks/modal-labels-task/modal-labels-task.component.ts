import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ColorPickerModule } from 'primeng/colorpicker';

import { EtiquetaTarea } from '../../../models/etiqueta-tarea.model';
import { LabelsTasksService } from '../../../services/labels-tasks.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-labels-task',
  standalone: true,
  imports: [
    DialogModule,
    FormsModule,
    CommonModule,
    ButtonModule,
    TableModule,
    ColorPickerModule
  ],
  templateUrl: './modal-labels-task.component.html',
  styleUrl: './modal-labels-task.component.scss'
})
export class ModalLabelsTaskComponent {
  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  idAreaSeleccionada: any;

  nuevaEtiqueta = {
    nombre: '',
    color: ''
  };

  etiquetas: EtiquetaTarea[] = [];

  cargando: boolean = false;

  constructor(private labelsTasksService: LabelsTasksService) { }

  ngOnInit() {
    this.labelsTasksService.etiquetas$.subscribe(et => {
      this.etiquetas = et;
    });
  }

  onHide = () => this.closeEvent.emit(false);

  async enviar(form: NgForm) {
    if (form.invalid || this.cargando) return;

    this.cargando = true;

    const id = crypto.randomUUID();

    const nueva: EtiquetaTarea = {
      id,
      idArea: this.idAreaSeleccionada ?? '',
      nombre: this.nuevaEtiqueta.nombre,
      color: this.nuevaEtiqueta.color,
      eliminado: false
    };

    try {
      await this.labelsTasksService.create(nueva);

      Swal.fire({
        icon: 'success',
        title: 'Etiqueta creada',
        text: `La etiqueta "${nueva.nombre}" se creó correctamente`,
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          container: 'swal-topmost'
        }
      });

      form.resetForm();
      this.nuevaEtiqueta = { nombre: '', color: '' };

    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear la etiqueta. Intenta nuevamente.'
      });

    } finally {
      this.cargando = false;
    }
  }

  async eliminarEtiqueta(et: EtiquetaTarea) {
    if (!et.id) return;

    try {
      await this.labelsTasksService.delete(et.id);

      Swal.fire({
        icon: 'info',
        title: 'Etiqueta eliminada',
        text: `"${et.nombre}" fue movida a eliminados`,
        timer: 1300,
        showConfirmButton: false,
        customClass: {
          container: 'swal-topmost'
        }
      });
    } catch (err) {
      console.error('Error eliminando etiqueta:', err);
    }
  }

  actualizarColor(et: EtiquetaTarea) {
    if (!et.id) return;

    this.labelsTasksService.update(
      { color: et.color },
      et.id
    );
  }

}
