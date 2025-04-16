import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';

import { TooltipModule } from 'primeng/tooltip';
import { Mantenimiento6x6AV } from '../../../../models/mantenimiento-6x6-av.model';
import { Maintenance6x6AvService } from '../../../../services/maintenance-6x6-av.service';
import { DatesHelperService } from '../../../../helpers/dates-helper.service';
import { ProgressBar60Component } from '../../../../components/common/progress-bar-60/progress-bar-60.component';

@Component({
  selector: 'app-modal-maintenance-av-check',
  standalone: true,
  imports: [
    DialogModule,
    CheckboxModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    ProgressBar60Component,
    TooltipModule
  ],
  templateUrl: './modal-maintenance-av-check.component.html',
  styleUrl: './modal-maintenance-av-check.component.scss'
})

export class ModalMaintenanceAvCheckComponent {
  @Input() showModal10x10: boolean = false;
  @Input() mantenimientoActivo: Mantenimiento6x6AV | null = null;
  @Output() closeEvent = new EventEmitter<boolean>();

  progreso: number = 0;
  mantenimientos: Mantenimiento6x6AV[] = [];
  formularioDeMantenimiento: FormGroup | any;
  opcionesDeMantenimiento = [
    {
      label: 'MANTENIMIENTO CONEXIONES',
      controlName: 'mantenimientoConexiones',
      tooltip: 'REVISIÓN DE CONEXIONES EN CADA TELEVISIÓN',
    },
    {
      label: 'MANTENIMIENTO CABLEADO',
      controlName: 'mantenimientoCableado',
      tooltip: 'ORDEN Y LIMPIEZA EN TODO EL CABLEADO Y TELEVISIONES',
    },
    {
      label: 'MANTENIMIENTO DE RACK',
      controlName: 'mantenimientoRack',
      tooltip: 'ORDEN EN RACK Y SU CABLEADO',
    },
    {
      label: 'MANTENIMIENTO CONTROLES',
      controlName: 'mantenimientoControles',
      tooltip: 'REVISIÓN DE CONTROLES REMOTOS Y PILAS',
    },
    {
      label: 'MANTENIMIENTO NIVEL DE AUDIO',
      controlName: 'mantenimientoNivelAudio',
      tooltip: 'NIVELES DE AUDIO CORRECTOS',
    },
    {
      label: 'MANTENIMIENTO DE CANALES',
      controlName: 'mantenimientoCanales',
      tooltip: 'CANALES ALTERNADOS',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: Maintenance6x6AvService,
    private messageService: MessageService,
    public datesHelper: DatesHelperService
  ) {
    this.crearFormulario();
  }

  async enviar() {
    if (this.formularioDeMantenimiento.invalid) {
      this.formularioDeMantenimiento.markAllAsTouched();
      this.showMessage('warn', 'Advertencia', 'Campos requeridos incompletos');
      return;
    }

    const mantenimiento: Mantenimiento6x6AV = {
      ...this.formularioDeMantenimiento.value,
      id: this.mantenimientoActivo?.id,
      idSucursal: this.mantenimientoActivo?.idSucursal,
      idUsuarioSoporte: this.mantenimientoActivo?.idUsuarioSoporte,
      fecha: this.mantenimientoActivo?.fecha,
      fechaFin: new Date,
      estatus: false,
    };

    await this.mantenimientoService.update(mantenimiento.id, mantenimiento);
    this.closeEvent.emit(false); // Cerrar modal
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
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

  onHide = () => this.closeEvent.emit(); // Cerrar modal}

  onCheckboxChange = (event: any) => this.progreso = event.checked ? this.progreso + 16.6667 : this.progreso - 16.6667;

}
