import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { AccordionModule } from 'primeng/accordion';

import { ProgressBar80Component } from '../../../components/progress-bar-80/progress-bar-80.component';
import { MaintenanceMtooService } from '../../../services/maintenance-mtto.service';
import { DatesHelperService } from '../../../../shared/helpers/dates-helper.service';
import { MantenimientoMtto } from '../../../interfaces/mantenimiento-mtto.model';

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
    TooltipModule,
    AccordionModule
  ], templateUrl: './modal-mateinance-mtto-check.component.html',
  styleUrl: './modal-mateinance-mtto-check.component.scss'
})

export class ModalMateinanceMttoCheckComponent implements OnInit {
  @Input() showModal: boolean = false;
  @Input() mantenimientosActivos: MantenimientoMtto[] = [];
  @Output() closeEvent = new EventEmitter<boolean>();

  formularioDeFreidoras: FormArray<FormGroup> = this.fb.array<FormGroup>([]);
  progresoPorFreidora: number[] = [];
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
    public datesHelper: DatesHelperService,
  ) { }

  ngOnInit() {
    this.mantenimientosActivos.forEach(element => {
      const formularioInicial = this.crearFormularioFreidora();

      this.formularioDeFreidoras.push(formularioInicial);
      this.progresoPorFreidora.push(0);
    });
  }

  crearFormularioFreidora(): FormGroup {
    const controles: Record<string, any> = {
      observaciones: this.fb.control('', Validators.required),
    };

    this.opcionesDeMantenimiento.forEach(opcion => {
      controles[opcion.controlName] = this.fb.control(false);
    });

    return this.fb.group(controles);
  }

  async enviar() {
    if (this.formularioDeFreidoras.invalid) {
      this.formularioDeFreidoras.markAllAsTouched();
      this.showMessage('warn', 'Advertencia', 'Campos requeridos incompletos');
      return;
    }

    const mantenimientos: MantenimientoMtto[] = this.formularioDeFreidoras.value.map((formValue: any, index: number) => ({
      ...formValue,
      id: this.mantenimientosActivos[index].id,
      idSucursal: this.mantenimientosActivos[index].idSucursal,
      idUsuarioSoporte: this.mantenimientosActivos[index].idUsuarioSoporte,
      fecha: this.mantenimientosActivos[index].fecha,
      fechaFin: new Date(),
      estatus: false,
    }));

    mantenimientos.forEach(async element => {
      await this.mantenimientoService.update(element.id, element);
    });

    this.closeEvent.emit(false); // cerrar modal
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  onHide = () => this.closeEvent.emit(); // Cerrar modal}

  onCheckboxChange(index: number) {
    const grupo = this.formularioDeFreidoras.at(index) as FormGroup;
    const totalChecks = this.opcionesDeMantenimiento.length;
    let checksMarcados = 0;

    this.opcionesDeMantenimiento.forEach(opcion => {
      if (grupo.get(opcion.controlName)?.value) {
        checksMarcados++;
      }
    });

    this.progresoPorFreidora[index] = (checksMarcados / totalChecks) * 100;
  }

  get formulariosFreidoras(): FormGroup[] {
    return this.formularioDeFreidoras.controls as FormGroup[];
  }
}
