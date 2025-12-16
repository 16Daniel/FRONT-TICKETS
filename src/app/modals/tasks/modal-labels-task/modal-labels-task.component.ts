import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DropdownModule } from 'primeng/dropdown';

import { EtiquetaTarea } from '../../../models/etiqueta-tarea.model';
import { LabelsTasksService } from '../../../services/labels-tasks.service';
import Swal from 'sweetalert2';
import { Area } from '../../../models/area.model';
import { AreasService } from '../../../services/areas.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-modal-labels-task',
  standalone: true,
  imports: [
    DialogModule,
    FormsModule,
    CommonModule,
    ButtonModule,
    TableModule,
    ColorPickerModule,
    DropdownModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './modal-labels-task.component.html',
  styleUrl: './modal-labels-task.component.scss'
})
export class ModalLabelsTaskComponent {
  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  areas: Area[] = [];
  idAreaSeleccionada: string | null = null;

  nuevaEtiqueta = {
    nombre: '',
    color: '',
    idArea: null
  };

  etiquetas: EtiquetaTarea[] = [];
  cargando: boolean = false;

  constructor(
    private labelsTasksService: LabelsTasksService,
    private areasService: AreasService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.areasService.areas$.subscribe(areas => this.areas = areas);
    this.labelsTasksService.etiquetas$.subscribe(() => {
      this.aplicarFiltroArea();
    });

  }

  onHide = () => this.closeEvent.emit(false);

  async enviar(form: NgForm) {
    if (form.invalid || this.cargando) return;

    this.cargando = true;

    const id = crypto.randomUUID();

    const nueva: EtiquetaTarea = {
      id,
      idArea: this.nuevaEtiqueta.idArea!,
      nombre: this.nuevaEtiqueta.nombre,
      color: this.nuevaEtiqueta.color,
      eliminado: false
    };

    try {
      await this.labelsTasksService.create(nueva);

      this.showMessage('success', 'Success', 'Enviado correctamente');

      // Swal.fire({
      //   icon: 'success',
      //   title: 'Etiqueta creada',
      //   text: `La etiqueta "${nueva.nombre}" se creó correctamente`,
      //   timer: 1500,
      //   showConfirmButton: false,
      //   customClass: {
      //     container: 'swal-topmost'
      //   }
      // });

      form.resetForm();
      this.nuevaEtiqueta = { nombre: '', color: '', idArea: this.nuevaEtiqueta.idArea };

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

  onAreaChange(idArea: string) {
    this.idAreaSeleccionada = idArea;
    this.aplicarFiltroArea();
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  private aplicarFiltroArea() {
    this.etiquetas = this.labelsTasksService.filtrarPorArea(this.idAreaSeleccionada);
  }

}
