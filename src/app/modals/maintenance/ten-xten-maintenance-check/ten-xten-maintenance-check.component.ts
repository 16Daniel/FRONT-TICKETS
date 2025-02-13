import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ten-xten-maintenance-check',
  standalone: true,
  imports: [
    DialogModule,
    CheckboxModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './ten-xten-maintenance-check.component.html',
  styleUrl: './ten-xten-maintenance-check.component.scss',
})
export class TenXtenMaintenanceCheckComponent {
  @Input() showModal10x10: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  maintenanceForm: FormGroup;

  maintenanceOptions = [
    { label: 'MANTENIMIENTO CAJA', controlName: 'mantenimientoCaja' },
    { label: 'MANTENIMIENTO DE IMPRESORAS', controlName: 'mantenimientoImpresoras' },
    { label: 'MANTENIMIENTO DE RACK', controlName: 'mantenimientoRack' },
    {
      label: 'MANTENIMIENTO DE PUNTOS DE VENTA / TABLETAS',
      controlName: 'mantenimientoPuntosVentaTabletas',
    },
    {
      label: 'MANTENIMIENTO EN CONTENIDOS Y SISTEMA DE CABLE',
      controlName: 'mantenimientoContenidosSistemaCable',
    },
    { label: 'MANTENIMIENTO DE INTERNET', controlName: 'mantenimientoInternet' },
    { label: 'MANTENIMIENTO DE CCTV', controlName: 'mantenimientoCCTV' },
    { label: 'MANTENIMIENTO DE NO BRAKES', controlName: 'mantenimientoNoBrakes' },
    {
      label: 'MANTENIMIENTO TIEMPOS EN COCINA',
      controlName: 'mantenimientoTiemposCocina',
    },
    {
      label: 'MANTENIMIENTO CONCENTRADOR DE APPS',
      controlName: 'mantenimientoConcentradorApps',
    },
  ];

  constructor(private fb: FormBuilder) {
    this.maintenanceForm = this.fb.group({
      observaciones: ['']
    });

    this.maintenanceOptions.forEach((option) => {
      this.maintenanceForm.addControl(
        option.controlName,
        this.fb.control(false)
      );
    });
  }

  saveToFirebase() {
    const formData: Mantenimiento10x10 = {
      ...this.maintenanceForm.value,
      timestamp: new Date(),
    };
    console.log(formData);
    // this.firestore.collection('maintenance').add(formData).then(() => {
    //   console.log('Registro guardado en Firebase');
    //   this.closeModal();
    // }).catch(error => {
    //   console.error('Error guardando en Firebase:', error);
    // });
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }
}
