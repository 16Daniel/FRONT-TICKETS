import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { LabelsTasksService } from '../../services/labels-tasks.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { EtiquetaTarea } from '../../interfaces/etiqueta-tarea.interface';

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
  templateUrl: './etiquetas-tarea-dialog.component.html',
  styleUrl: './etiquetas-tarea-dialog.component.scss'
})
export class EtiquetasTareaDialogComponent implements OnDestroy, OnInit {
  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  sucursales: Sucursal[] = [];
  idSucursalSeleccionada: string | null = null;

  private subs = new Subscription();

  nuevaEtiqueta = {
    nombre: '',
    color: '',
    idSucursal: null
  };

  etiquetas: EtiquetaTarea[] = [];
  cargando: boolean = false;

  constructor(
    private labelsTasksService: LabelsTasksService,
    private branchesService: BranchesService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.subs.add(
      this.branchesService.get().subscribe(sucursales => {
        this.sucursales = sucursales;
      })
    );

    this.subs.add(
      this.labelsTasksService.etiquetas$.subscribe(etiquetas => {
        this.etiquetas = etiquetas;
        this.aplicarFiltroSucursal();
      })
    );

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }


  onHide = () => this.closeEvent.emit(false);

  async enviar(form: NgForm) {
    if (form.invalid || this.cargando) return;

    this.cargando = true;

    // const id = crypto.randomUUID();


    const nueva: EtiquetaTarea = {
      idSucursal: this.nuevaEtiqueta.idSucursal!,
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
      this.nuevaEtiqueta = { nombre: '', color: '', idSucursal: this.nuevaEtiqueta.idSucursal };

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

    const result = await Swal.fire({
      title: '¿Eliminar etiqueta?',
      text: `La etiqueta "${et.nombre}" será movida a eliminados`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
      customClass: {
        container: 'swal-topmost'
      }
    });

    if (!result.isConfirmed) return;

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

  onSucursalChange(idSucursal: string) {
    this.idSucursalSeleccionada = idSucursal;
    this.aplicarFiltroSucursal();
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  private aplicarFiltroSucursal() {
    this.etiquetas = this.labelsTasksService.filtrarPorSucursal(this.idSucursalSeleccionada);
  }

  activarEdicion(etiqueta: any) {
    etiqueta.editando = true;
  }

  async guardarNombre(etiqueta: any) {
    etiqueta.editando = false;

    if (!etiqueta.nombre || etiqueta.nombre.trim().length < 3) {
      return;
    }

    await this.labelsTasksService.update(etiqueta, etiqueta.id);
    this.showMessage('success', 'Success', 'Enviado correctamente');
  }

}
