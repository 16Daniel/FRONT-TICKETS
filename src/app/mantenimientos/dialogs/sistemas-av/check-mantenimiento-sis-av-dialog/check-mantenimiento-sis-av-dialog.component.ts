import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Timestamp } from '@angular/fire/firestore';
import { TooltipModule } from 'primeng/tooltip';

import { MantenimientosSistemasService } from '../../../services/mantenimientos-sistemas.service';
import { MantenimientoAudioVideo } from '../../../interfaces/mantenimiento-audio-video.interface';
import { ProgressBar80Component } from '../../../components/progress-bar-80/progress-bar-80.component';
import { MaintenanceAvService } from '../../../services/maintenance-av.service';

@Component({
  selector: 'app-check-mantenimiento-sis-av-dialog',
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
  templateUrl: './check-mantenimiento-sis-av-dialog.component.html',
  styleUrl: './check-mantenimiento-sis-av-dialog.component.scss',
})
export class CheckMantenimientoSisAvComponent {
  private _mostrarModalAV: boolean = false;
  @Input() set mostrarModalAV(val: boolean) {
    this._mostrarModalAV = val;
    if (val) {
      this.cargarDatos();
    }
  }
  get mostrarModalAV(): boolean {
    return this._mostrarModalAV;
  }
  @Output() mostrarModalAVChange = new EventEmitter<boolean>();

  private _mantenimientoActivo: MantenimientoAudioVideo | null = null;
  @Input() set mantenimientoActivo(val: MantenimientoAudioVideo | null) {
    this._mantenimientoActivo = val;
    if (this.mostrarModalAV) {
      this.cargarDatos();
    }
  }
  get mantenimientoActivo(): MantenimientoAudioVideo | null {
    return this._mantenimientoActivo;
  }
  @Output() closeEvent = new EventEmitter<boolean>();

  progreso: number = 0;
  guardando: boolean = false;
  formularioDeMantenimiento: FormGroup | any;

  opcionesDeMantenimiento = [
    {
      label: 'REVISIÓN PANTALLAS Y SOPORTE',
      controlName: 'mantenimientoPantallasSoporte',
      tooltip: 'Verificación física de televisores: sin pixeles muertos, golpes ni leds visibles, y soportes bien fijados.',
    },
    {
      label: 'REVISIÓN SEÑAL DE VIDEO',
      controlName: 'mantenimientoSenalVideo',
      tooltip: 'Comprobación de que la señal de video llegue correctamente a todas las pantallas, sin intermitencias.',
    },
    {
      label: 'REVISIÓN FÍSICA Y FUNCIONAL DE BOCINAS',
      controlName: 'mantenimientoFuncionalBocinas',
      tooltip: 'Inspección del estado físico de las bocinas, fijación firme y ausencia de golpes o daños.',
    },
    {
      label: 'REVISIÓN TRANSMISIÓN DE AUDIO',
      controlName: 'mantenimientoTransmisionAudio',
      tooltip: 'Niveles óptimos, sin interferencias, correcta ecualización y temperatura del amplificador.',
    },
    {
      label: 'REVISIÓN Y ORDENAMIENTO DE CABLEADO',
      controlName: 'mantenimientoOrdenamientoCableado',
      tooltip: 'Inspección de cableado: detección de falsos contactos, funcionamiento de splitters y peinado de cables.',
    },
    {
      label: 'REVISIÓN DE NIVELES',
      controlName: 'mantenimientoNiveles',
      tooltip: 'Verificación de los niveles óptimos de audio y transmisión en las diferentes zonas de la sucursal.',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private mantenimientosSistemasService: MantenimientosSistemasService,
    private maintenanceAvService: MaintenanceAvService,
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

  cargarDatos() {
    if (!this.formularioDeMantenimiento) {
      this.crearFormulario();
    }
    if (this.mantenimientoActivo) {
      this.opcionesDeMantenimiento.forEach((opcion) => {
        const val = (this.mantenimientoActivo as any)?.[opcion.controlName] ?? false;
        this.formularioDeMantenimiento.get(opcion.controlName)?.setValue(!!val);
      });
      this.formularioDeMantenimiento.get('observaciones')?.setValue(this.mantenimientoActivo.observaciones || '');
      this.onCheckboxChange();
    } else {
      this.formularioDeMantenimiento.reset();
      this.progreso = 0;
    }
  }

  toggleCheckbox(controlName: string) {
    const ctrl = this.formularioDeMantenimiento.get(controlName);
    if (ctrl) {
      ctrl.setValue(!ctrl.value);
      this.onCheckboxChange();
    }
  }

  obtenerCompletadas(): number {
    if (!this.formularioDeMantenimiento) return 0;
    return this.opcionesDeMantenimiento.filter(
      (opc) => this.formularioDeMantenimiento.get(opc.controlName)?.value
    ).length;
  }

  async enviar() {
    if (this.formularioDeMantenimiento.invalid) {
      this.formularioDeMantenimiento.markAllAsTouched();
      this.showMessage('warn', 'Advertencia', 'Por favor complete las observaciones requeridas.');
      return;
    }

    this.guardando = true;
    try {
      const mantenimiento: MantenimientoAudioVideo = {
        ...this.formularioDeMantenimiento.value,
        id: this.mantenimientoActivo?.id,
        participantesChat: this.mantenimientoActivo?.participantesChat,
        idSucursal: this.mantenimientoActivo?.idSucursal,
        idUsuarioSoporte: this.mantenimientoActivo?.idUsuarioSoporte,
        fecha: this.mantenimientoActivo?.fecha,
        fechaFin: new Date(),
        estatus: false,
      };

      await this.maintenanceAvService.update(mantenimiento.id, mantenimiento);
      this.showMessage('success', 'Éxito', 'Registro de mantenimiento AV guardado correctamente');
      this.closeEvent.emit(false);
    } catch (error) {
      console.error(error);
      this.showMessage('error', 'Error', 'Ocurrió un error al guardar el registro.');
    } finally {
      this.guardando = false;
    }
  }

  onHide() {
    this.mostrarModalAV = false;
    this.mostrarModalAVChange.emit(false);
    this.closeEvent.emit(false);
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  getDate(tsmp: Timestamp | any): Date {
    try {
      if (!tsmp) return new Date();
      if (typeof tsmp.toDate === 'function') {
        return tsmp.toDate();
      }
      return new Date(tsmp);
    } catch {
      return tsmp || new Date();
    }
  }

  onCheckboxChange(event?: any) {
    let completadas = 0;
    this.opcionesDeMantenimiento.forEach((opcion) => {
      if (this.formularioDeMantenimiento.get(opcion.controlName)?.value) {
        completadas++;
      }
    });
    this.progreso = Math.round((completadas / this.opcionesDeMantenimiento.length) * 100);
  }
}
