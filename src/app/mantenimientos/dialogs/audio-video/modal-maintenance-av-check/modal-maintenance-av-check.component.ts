import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';

import { Maintenance6x6AvService } from '../../../services/maintenance-av.service';
import { MantenimientoSysAv } from '../../../interfaces/mantenimiento-sys-av.interface';
import { ProgressBar80Component } from "../../../components/progress-bar-80/progress-bar-80.component";

@Component({
  selector: 'app-modal-maintenance-av-check',
  standalone: true,
  imports: [
    DialogModule,
    CheckboxModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    TooltipModule,
    ProgressBar80Component
],
  templateUrl: './modal-maintenance-av-check.component.html',
  styleUrl: './modal-maintenance-av-check.component.scss'
})

export class ModalMaintenanceAvCheckComponent {
  @Input() showModal8x8: boolean = false;
  @Input() mantenimientoActivo: MantenimientoSysAv | null = null;
  @Output() closeEvent = new EventEmitter<boolean>();

  progreso: number = 0;
  mantenimientos: MantenimientoSysAv[] = [];
  formularioDeMantenimiento: FormGroup | any;
  opcionesDeMantenimiento = [
    {
      label: 'REVISIÓN PANTALLAS Y SOPORTE',
      controlName: 'mantenimientoPantallasSoporte',
      tooltip: 'VERIFICACIÓN DEL ESTADO FÍSICO DE LAS TELEVISIONES: AUSENCIA DE PIXELES MUERTOS, GOLPES, LEDS VISIBLES, ENTRADAS DAÑADAS Y CORRECTA FIJACIÓN DE LOS SOPORTES A MURO O ESTRUCTURA.'
    },
    {
      label: 'REVISIÓN SEÑAL DE VIDEO',
      controlName: 'mantenimientoSenalVideo',
      tooltip: 'COMPROBACIÓN DE QUE LA SEÑAL DE VIDEO LLEGUE CORRECTAMENTE A TODAS LAS PANTALLAS, SIN INTERMITENCIAS, CORTES O DEGRADACIÓN EN AMBOS CONTENIDOS DISTRIBUIDOS.',
    },
    {
      label: 'AJUSTE DE PARÁMETROS DE IMAGEN',
      controlName: 'mantenimientoParametrosImagen',
      tooltip: 'AJUSTE DE BRILLO, CONTRASTE, NITIDEZ, COLOR Y LUMINOSIDAD DE LAS PANTALLAS CUANDO SEA NECESARIO, ASEGURANDO UNIFORMIDAD Y CORRECTA VISUALIZACIÓN EN LA SUCURSAL.',
    },
    {
      label: 'REVISIÓN FÍSICA Y FUNCIONAL DE BOCINAS',
      controlName: 'mantenimientoFuncionalBocinas',
      tooltip: 'INSPECCIÓN DEL ESTADO FÍSICO DE LAS BOCINAS, CORRECTA FIJACIÓN, CONEXIONES FIRMES Y AUSENCIA DE GOLPES O DAÑOS VISIBLES.',
    },
    {
      label: 'REVISIÓN TRANSMISIÓN DE AUDIO',
      controlName: 'mantenimientoTransmisionAudio',
      tooltip: 'NIVELES ÓPTIMOS, AUSENCIA DE INTERFERENCIAS, CORRECTA ECUALIZACIÓN Y VALIDACIÓN DEL ESTADO Y TEMPERATURA DEL AMPLIFICADOR.',
    },
    {
      label: 'REVISIÓN Y ORDENAMIENTO DE CABLEADO',
      controlName: 'mantenimientoOrdenamientoCableado',
      tooltip: 'INSPECCIÓN DEL CABLEADO DE AUDIO Y VIDEO: DETECCIÓN DE FALSOS CONTACTOS, FUNCIONAMIENTO CORRECTO DE SPLITTERS, CABLES NO COLGADOS NI TENSIONADOS Y PEINADO CUANDO SE REQUIERA.',
    },
    {
      label: 'REVISIÓN RACK',
      controlName: 'mantenimientoLimpiezaRack',
      tooltip: 'LIMPIEZA INTERNA (SOPLETEADO) Y EXTERNA DEL RACK, REVISIÓN FÍSICA DE EQUIPOS (MIXER, AMPLIFICADOR, ACONDICIONADOR DE VOLTAJE, MODULADORES, SWITCH A/B, PLAYERS), CORRECTA ORGANIZACIÓN, ROTULACIÓN Y AUSENCIA DE OBJETOS AJENOS.',
    },
    {
      label: 'VERIFICACIÓN ELÉCTRICA',
      controlName: 'mantenimientoElectrico',
      tooltip: 'MEDICIÓN DE LA TENSIÓN ENTREGADA POR EL REGULADOR O ACONDICIONADOR DE VOLTAJE Y REVISIÓN DEL ESTADO Y FUNCIONAMIENTO DE CONTROLES REMOTOS DE PANTALLAS Y EQUIPOS.',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private maintenance6x6AvService: Maintenance6x6AvService,
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
      this.showMessage('warn', 'Advertencia', 'Campos requeridos incompletos');
      return;
    }

    const mantenimiento: MantenimientoSysAv = {
      ...this.formularioDeMantenimiento.value,
      id: this.mantenimientoActivo?.id,
      participantesChat: this.mantenimientoActivo?.participantesChat,
      idSucursal: this.mantenimientoActivo?.idSucursal,
      idUsuarioSoporte: this.mantenimientoActivo?.idUsuarioSoporte,
      fecha: this.mantenimientoActivo?.fecha,
      fechaFin: new Date,
      estatus: false,
    };

    await this.maintenance6x6AvService.update(mantenimiento.id, mantenimiento);
    // this.showMessage('success', 'Success', 'ENVIADO CORRECTAMENTE');
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
    this.progreso = event.checked
      ? this.progreso + 12.5
      : this.progreso - 12.5;
  }
}
