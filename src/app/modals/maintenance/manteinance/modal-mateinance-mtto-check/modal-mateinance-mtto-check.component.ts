import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

import { MantenimientoMtto } from '../../../../models/mantenimiento-mtto.model';
import { DatesHelperService } from '../../../../helpers/dates-helper.service';
import { MaintenanceMtooService } from '../../../../services/maintenance-mtto.service';
import { ProgressBar80Component } from '../../../../components/common/progress-bar-80/progress-bar-80.component';

@Component({
  selector: 'app-modal-mateinance-mtto-check',
  standalone: true,
  imports: [
    DialogModule,
    CheckboxModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    ProgressBar80Component,
    TooltipModule
  ], templateUrl: './modal-mateinance-mtto-check.component.html',
  styleUrl: './modal-mateinance-mtto-check.component.scss'
})

export class ModalMateinanceMttoCheckComponent {
  @Input() showModal: boolean = false;
  @Input() mantenimientoActivo: MantenimientoMtto | null = null;
  @Output() closeEvent = new EventEmitter<boolean>();

  hayFreidorasComprobadas: boolean = false;
  cantidadFreidoras: number | null = null;
  progreso: number = 0;
  mantenimientos: MantenimientoMtto[] = [];
  formularioDeMantenimiento: FormGroup | any;
  opcionesDeMantenimiento = [
    {
      label: 'MANTENIMIENTO TERMOSTATO',
      controlName: 'mantenimientoTermostato',
      tooltip: '¿TERMOSTATO HACE SU FUNCION CORRECTA?',
    },
    {
      label: 'MANTENIMIENTO PERILLAS',
      controlName: 'mantenimientoPerillas',
      tooltip: '¿LAS PERILLAS SE ENCUENTRAN EN BUENAS CONDICIONES?',
    },
    {
      label: 'MANTENIMIENTO TORNILLERIA',
      controlName: 'mantenimientoTornilleria',
      tooltip: 'LA TORNILLERIA ESTA COMPLETA Y BIEN FIRME TODO EL ARMAZON',
    },
    {
      label: 'MANTENIMIENTO RUEDAS',
      controlName: 'mantenimientoRuedas',
      tooltip: '¿CUENTA CON RUEDITAS Y FUNCIONAN CORRECTAMENTE?',
    },
    {
      label: 'MANTENIMIENTO CABLEADO',
      controlName: 'mantenimientoCableado',
      tooltip: '¿EL CABLEADO, TERMOPILA, TERMOSTATO, HI LIMIT PILOTO, Y VAVULA MINIVOLTICA ESTAN BIEN SUJETOS, LIMPIOS Y EN BUENAS CONDICIONES?',
    },
    {
      label: 'MANTENIMIENTO TINA',
      controlName: 'mantenimientoTina',
      tooltip: '¿LA TINA DE LA FREIDORA Y VALVULA DE DRENADO ESTA EN BUEN ESTADO Y SIN FUGAS?',
    },
    {
      label: 'MANTENIMIENTO MANGUERAS',
      controlName: 'mantenimientoMangueras',
      tooltip: '¿LAS MANGUERAS Y CONEXIONES FUNCIONAN CORRECTAMENTE Y SIN FUGAS?',
    },
    {
      label: 'MANTENIMIENTO LLAVES DE PASO',
      controlName: 'mantenimientoLlavesDePaso',
      tooltip: '¿LAS LLAVES DE PASO DE GAS FUNCIONAN?',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MaintenanceMtooService,
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

    const mantenimiento: MantenimientoMtto = {
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

  onCheckboxChange = (event: any) => this.progreso = event.checked ? this.progreso + 12.5 : this.progreso - 12.5;

  comprobarFreidoras() {
    if (this.cantidadFreidoras! > 0) {
      this.hayFreidorasComprobadas = true;
    }
    else {
      this.showMessage('warn', 'Advertencia', 'La cantidad de freidoras debe ser mayor a 0');
    }
  }
}
