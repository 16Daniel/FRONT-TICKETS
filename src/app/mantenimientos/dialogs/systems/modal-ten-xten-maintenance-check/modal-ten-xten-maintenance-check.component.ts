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
  @Input() mostrarModalMtooTI: boolean = false;
  @Input() mantenimientoActivo: MantenimientoSys | null = null;
  @Output() closeEvent = new EventEmitter<boolean>();

  progreso: number = 0;
  mantenimientos: MantenimientoSys[] = [];
  formularioDeMantenimiento: FormGroup | any;
  opcionesDeMantenimiento = [
    { label: 'MANTENIMIENTO CAJA', controlName: 'mantenimientoCaja', tooltip: 'AREA Y CABLEADO DE CAJA ACOMODADOS Y MTTO DE PC' },
    {
      label: 'MANTENIMIENTO DE IMPRESORAS',
      controlName: 'mantenimientoImpresoras',
      tooltip: 'IMPRESORAS FUNCIONANDO CORRECTAMENTE Y EN BUEN ESTADO',
    },
    {
      label: 'MANTENIMIENTO DE RACK',
      controlName: 'mantenimientoRack',
      tooltip: 'AREA Y CABLEADO DE SISTEMAS EN RACK ACOMODADOS',
    },
    {
      label: 'MANTENIMIENTO DE PUNTOS DE VENTA / TABLETAS',
      controlName: 'mantenimientoPuntosVentaTabletas',
      tooltip: 'AREA Y CABLEADO DE PDV ACOMODADOS  / NUMERO DE TABLETAS COMPLETAS Y EN BUEN ESTADO',
    },
    {
      label: 'MANTENIMIENTO DE INTERNET',
      controlName: 'mantenimientoInternet',
      tooltip: 'GARANTIZAR 2 INTERNET ESTABLES Y NOMBRES DE RED CORRECTOS',
    },
    {
      label: 'MANTENIMIENTO DE CCTV',
      controlName: 'mantenimientoCCTV',
      tooltip: 'AREA Y CABLEADO DE CCTV ACOMODADOS CON CAMARAS EN LINEA',
    },
    {
      label: 'MANTENIMIENTO DE NO BRAKES',
      controlName: 'mantenimientoNoBrakes',
      tooltip: 'GARANTIZAR QUE LOS EQUIPOS TENGAN NO BREAK Y ESTEN FUNCIONANDO',
    },
    {
      label: 'MANTENIMIENTO TIEMPOS EN COCINA',
      controlName: 'mantenimientoTiemposCocina',
      tooltip: 'AREA Y CABLEADO DE TIEMPOS EN COCINA ACOMODADOS Y GARANTIZAR FUNCIONAMIENTO',
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

  async enviar() {
    if (this.formularioDeMantenimiento.invalid) {
      this.formularioDeMantenimiento.markAllAsTouched();
      this.showMessage('warn', 'Advertencia', 'Campos requeridos incompletos');
      return;
    }

    const mantenimiento: MantenimientoSys = {
      ...this.formularioDeMantenimiento.value,
      id: this.mantenimientoActivo?.id,
      participantesChat: this.mantenimientoActivo?.participantesChat,
      idSucursal: this.mantenimientoActivo?.idSucursal,
      idUsuarioSoporte: this.mantenimientoActivo?.idUsuarioSoporte,
      fecha: this.mantenimientoActivo?.fecha,
      fechaFin: new Date,
      estatus: false,
    };

    await this.mantenimientosSistemasService.update(mantenimiento.id, mantenimiento);
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

  onCheckboxChange(event?: any) {
    let completadas = 0;
    this.opcionesDeMantenimiento.forEach(opcion => {
      if (this.formularioDeMantenimiento.get(opcion.controlName)?.value) {
        completadas++;
      }
    });
    this.progreso = Math.round((completadas / this.opcionesDeMantenimiento.length) * 100);
  }
}
