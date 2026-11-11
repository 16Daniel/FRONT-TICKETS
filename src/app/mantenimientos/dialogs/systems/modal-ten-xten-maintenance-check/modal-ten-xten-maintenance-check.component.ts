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

import { ProgressBarComponent } from '../../../components/progress-bar/progress-bar.component';
import { MantenimientosSistemasService } from '../../../services/mantenimientos-sistemas.service';
import { MantenimientoSys } from '../../../interfaces/mantenimiento-sys.interface';

@Component({
  selector: 'app-modal-ten-xten-maintenance-check',
  standalone: true,
  imports: [
    DialogModule,
    CheckboxModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    ProgressBarComponent,
    TooltipModule
  ],
  templateUrl: './modal-ten-xten-maintenance-check.component.html',
  styleUrl: './modal-ten-xten-maintenance-check.component.scss',
})
export class ModalTenXtenMaintenanceCheckComponent {
  private _mostrarModalMtooTI: boolean = false;
  @Input() set mostrarModalMtooTI(val: boolean) {
    this._mostrarModalMtooTI = val;
    if (val) {
      this.cargarDatos();
    }
  }
  get mostrarModalMtooTI(): boolean {
    return this._mostrarModalMtooTI;
  }
  @Output() mostrarModalMtooTIChange = new EventEmitter<boolean>();

  private _mantenimientoActivo: MantenimientoSys | null = null;
  @Input() set mantenimientoActivo(val: MantenimientoSys | null) {
    this._mantenimientoActivo = val;
    if (this.mostrarModalMtooTI) {
      this.cargarDatos();
    }
  }
  get mantenimientoActivo(): MantenimientoSys | null {
    return this._mantenimientoActivo;
  }
  @Output() closeEvent = new EventEmitter<boolean>();

  progreso: number = 0;
  guardando: boolean = false;
  formularioDeMantenimiento: FormGroup | any;

  opcionesDeMantenimiento = [
    {
      label: 'MANTENIMIENTO CAJA',
      controlName: 'mantenimientoCaja',
      tooltip: 'Área y cableado de caja acomodados y mantenimiento de PC'
    },
    {
      label: 'MANTENIMIENTO DE IMPRESORAS',
      controlName: 'mantenimientoImpresoras',
      tooltip: 'Impresoras funcionando correctamente y en buen estado',
    },
    {
      label: 'MANTENIMIENTO DE RACK',
      controlName: 'mantenimientoRack',
      tooltip: 'Área y cableado de sistemas en rack acomodados',
    },
    {
      label: 'MANTENIMIENTO DE PDV / TABLETAS',
      controlName: 'mantenimientoPuntosVentaTabletas',
      tooltip: 'Área y cableado de PDV acomodados / tabletas completas y en buen estado',
    },
    {
      label: 'MANTENIMIENTO DE INTERNET',
      controlName: 'mantenimientoInternet',
      tooltip: 'Garantizar 2 enlaces estables y nombres de red correctos',
    },
    {
      label: 'MANTENIMIENTO DE CCTV',
      controlName: 'mantenimientoCCTV',
      tooltip: 'Área y cableado de CCTV acomodados con cámaras en línea',
    },
    {
      label: 'MANTENIMIENTO DE NO-BREAKS',
      controlName: 'mantenimientoNoBrakes',
      tooltip: 'Garantizar que los equipos cuenten con No-Break y estén funcionando',
    },
    {
      label: 'MANTENIMIENTO TIEMPOS EN COCINA',
      controlName: 'mantenimientoTiemposCocina',
      tooltip: 'Área y cableado de tiempos en cocina acomodados y funcionamiento verificado',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private mantenimientosSistemasService: MantenimientosSistemasService,
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
      const mantenimiento: MantenimientoSys = {
        ...this.formularioDeMantenimiento.value,
        id: this.mantenimientoActivo?.id,
        participantesChat: this.mantenimientoActivo?.participantesChat,
        idSucursal: this.mantenimientoActivo?.idSucursal,
        idUsuarioSoporte: this.mantenimientoActivo?.idUsuarioSoporte,
        fecha: this.mantenimientoActivo?.fecha,
        fechaFin: new Date(),
        estatus: false,
      };

      await this.mantenimientosSistemasService.update(mantenimiento.id, mantenimiento);
      this.showMessage('success', 'Éxito', 'Registro de mantenimiento guardado correctamente');
      this.closeEvent.emit(false);
    } catch (error) {
      console.error(error);
      this.showMessage('error', 'Error', 'Ocurrió un error al guardar el registro.');
    } finally {
      this.guardando = false;
    }
  }

  onHide() {
    this.mostrarModalMtooTI = false;
    this.mostrarModalMtooTIChange.emit(false);
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
