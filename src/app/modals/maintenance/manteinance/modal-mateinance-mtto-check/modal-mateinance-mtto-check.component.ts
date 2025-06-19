import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { AccordionModule } from 'primeng/accordion';

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
    TooltipModule,
    AccordionModule
  ], templateUrl: './modal-mateinance-mtto-check.component.html',
  styleUrl: './modal-mateinance-mtto-check.component.scss'
})

export class ModalMateinanceMttoCheckComponent implements OnInit {
  @Input() showModal: boolean = false;
  @Input() mantenimientoActivo: MantenimientoMtto | null = null;
  @Output() closeEvent = new EventEmitter<boolean>();

  formularioDeFreidoras: FormArray<FormGroup> = this.fb.array<FormGroup>([]);
  hayFreidorasComprobadas: boolean = false;
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
    private cdr: ChangeDetectorRef
  ) {
    // this.crearFormularioFreidora();
  }

  ngOnInit() {
    if (this.mantenimientoActivo) {
      const formularioInicial = this.crearFormularioFreidora();

      // Opcional: si quieres prellenarlo con datos de mantenimientoActivo
      // formularioInicial.patchValue(this.mantenimientoActivo);

      this.formularioDeFreidoras.push(formularioInicial);
      this.progresoPorFreidora.push(0);
    }
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

    const base = this.mantenimientoActivo!;
    const mantenimientos: MantenimientoMtto[] = this.formularioDeFreidoras.value.map((formValue: any, index: number) => ({
      ...formValue,
      id: index === 0 ? base.id : '', // solo el primero mantiene el ID
      idSucursal: base.idSucursal,
      idUsuarioSoporte: base.idUsuarioSoporte,
      fecha: base.fecha,
      fechaFin: new Date(),
      estatus: false,
    }));

    for (let i = 0; i < mantenimientos.length; i++) {
      const mtto = mantenimientos[i];
      if (i === 0 && mtto.id) {
        await this.mantenimientoService.update(mtto.id, mtto);
      } else {
        await this.mantenimientoService.create2(mtto);
      }
    }

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

  comprobarFreidoras() {
    if (this.cantidadFreidoras! > 0) {
      this.hayFreidorasComprobadas = true;

      // 👉 Borra desde la segunda posición para conservar el primero
      while (this.formularioDeFreidoras.length > 1) {
        this.formularioDeFreidoras.removeAt(1);
      }

      this.progresoPorFreidora.splice(1); // mantiene solo el primero

      for (let i = 1; i < this.cantidadFreidoras!; i++) {
        this.formularioDeFreidoras.push(this.crearFormularioFreidora());
        this.progresoPorFreidora.push(0);
      }

      this.cdr.detectChanges();
    } else {
      this.showMessage('warn', 'Advertencia', 'La cantidad de freidoras debe ser mayor a 0');
    }
  }

  get formulariosFreidoras(): FormGroup[] {
    return this.formularioDeFreidoras.controls as FormGroup[];
  }
}
