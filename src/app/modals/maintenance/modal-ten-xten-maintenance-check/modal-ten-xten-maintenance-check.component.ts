import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { Maintenance10x10Service } from '../../../services/maintenance-10x10.service';
import { MessageService } from 'primeng/api';
import { Timestamp } from '@angular/fire/firestore';
import { ProgressBarComponent } from '../../../components/common/progress-bar/progress-bar.component';

@Component({
  selector: 'app-modal-ten-xten-maintenance-check',
  standalone: true,
  imports: [
    DialogModule,
    CheckboxModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    ProgressBarComponent
  ],
  templateUrl: './modal-ten-xten-maintenance-check.component.html',
  styleUrl: './modal-ten-xten-maintenance-check.component.scss',
})
export class ModalTenXtenMaintenanceCheckComponent {
  @Input() showModal10x10: boolean = false;
  @Input() mantenimientoActivo: Mantenimiento10x10 | null = null;
  @Output() closeEvent = new EventEmitter<boolean>();

  progreso: number = 0;
  mantenimientos: Mantenimiento10x10[] = [];
  formularioDeMantenimiento: FormGroup | any;
  opcionesDeMantenimiento = [
    { label: 'MANTENIMIENTO CAJA', controlName: 'mantenimientoCaja' },
    {
      label: 'MANTENIMIENTO DE IMPRESORAS',
      controlName: 'mantenimientoImpresoras',
    },
    { label: 'MANTENIMIENTO DE RACK', controlName: 'mantenimientoRack' },
    {
      label: 'MANTENIMIENTO DE PUNTOS DE VENTA / TABLETAS',
      controlName: 'mantenimientoPuntosVentaTabletas',
    },
    {
      label: 'MANTENIMIENTO EN CONTENIDOS Y SISTEMA DE CABLE',
      controlName: 'mantenimientoContenidosSistemaCable',
    },
    {
      label: 'MANTENIMIENTO DE INTERNET',
      controlName: 'mantenimientoInternet',
    },
    { label: 'MANTENIMIENTO DE CCTV', controlName: 'mantenimientoCCTV' },
    {
      label: 'MANTENIMIENTO DE NO BRAKES',
      controlName: 'mantenimientoNoBrakes',
    },
    {
      label: 'MANTENIMIENTO TIEMPOS EN COCINA',
      controlName: 'mantenimientoTiemposCocina',
    },
    {
      label: 'MANTENIMIENTO CONCENTRADOR DE APPS',
      controlName: 'mantenimientoConcentradorApps',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: Maintenance10x10Service,
    private messageService: MessageService
  ) {
    this.crearFormulario();
  }

  crearFormulario() {
    this.formularioDeMantenimiento = this.fb.group({
      observaciones: ['', Validators.required],
    });

    this.opcionesDeMantenimiento.forEach((opcion) => {
      this.formularioDeMantenimiento.addControl(
        opcion.controlName,
        this.fb.control(false)
      );
    });
  }

  async enviar() {
    if (this.formularioDeMantenimiento.invalid) {
      this.formularioDeMantenimiento.markAllAsTouched();
      this.showMessage('error', 'Error', 'Campos requeridos incompletos');
      return;
    }

    const mantenimiento: Mantenimiento10x10 = {
      ...this.formularioDeMantenimiento.value,
      id: this.mantenimientoActivo?.id,
      idSucursal: this.mantenimientoActivo?.idSucursal,
      idUsuarioSoporte: this.mantenimientoActivo?.idUsuarioSoporte,
      fecha: this.mantenimientoActivo?.fecha,
      estatus: false,
    };

    await this.mantenimientoService.update(mantenimiento.id, mantenimiento);
    this.showMessage('success', 'Success', 'ENVIADO CORRECTAMENTE');
    this.closeEvent.emit(false); // Cerrar modal
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  getDate(tsmp: Timestamp | any): Date {
    try {
      // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
      const firestoreTimestamp = tsmp; // Ejemplo
      const date = firestoreTimestamp.toDate(); // Convierte a Date
      return date;
    } catch {
      return tsmp;
    }
  }

  onCheckboxChange(event: any) {
    console.log('Checkbox cambiado:', event.checked);
    this.progreso = event.checked ? (this.progreso + 10) : (this.progreso - 10);
  }
}
